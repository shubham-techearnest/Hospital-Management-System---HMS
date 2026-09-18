package com.health360.iam.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.ImpersonationSessionEntity;
import com.health360.iam.infrastructure.persistence.entity.RefreshTokenEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.ImpersonationSessionRepository;
import com.health360.iam.infrastructure.persistence.repository.PermissionRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.iam.presentation.dto.response.ImpersonationCapabilityResponse;
import com.health360.iam.presentation.dto.response.ImpersonationContextResponse;
import com.health360.iam.presentation.dto.response.ImpersonationPartyResponse;
import com.health360.iam.presentation.dto.response.ImpersonationStartResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImpersonationService {

    private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";

    private final ImpersonationEligibility eligibility;
    private final ImpersonationSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PermissionRepository permissionRepository;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserProfileMapper userProfileMapper;
    private final AuditLogService auditLogService;

    public ImpersonationCapabilityResponse capability() {
        boolean enabled = eligibility.isEnabled();
        return ImpersonationCapabilityResponse.builder()
                .enabled(enabled)
                .environmentLabel(enabled ? eligibility.environmentLabel() : null)
                .maxDurationMinutes(eligibility.maxDurationMinutes())
                .build();
    }

    @Transactional
    public ImpersonationStartResponse start(UserPrincipal actor, UUID targetUserId, String reason) {
        eligibility.assertEnabled();
        assertPlatformAdmin(actor);
        if (actor.isImpersonating()) {
            throw ImpersonationExceptions.nested();
        }

        UserEntity subject = userRepository.findById(targetUserId)
                .orElseThrow(ImpersonationExceptions::notFound);
        if (!actor.getTenantId().equals(subject.getTenantId()) || subject.getDeletedAt() != null) {
            throw ImpersonationExceptions.notFound();
        }

        validateTarget(actor.getUserId(), subject);

        List<String> subjectRoles = userRoleRepository.findRoleNamesByUserId(subject.getId());
        List<String> subjectPermissions = permissionRepository.findPermissionCodesByUserId(subject.getId());
        List<String> actorRoles = userRoleRepository.findRoleNamesByUserId(actor.getUserId());

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(eligibility.maxDurationMinutes() * 60);

        ImpersonationSessionEntity session = new ImpersonationSessionEntity();
        session.setTenantId(actor.getTenantId());
        session.setActorUserId(actor.getUserId());
        session.setSubjectUserId(subject.getId());
        session.setReason(trimReason(reason));
        session.setEnvironmentLabel(eligibility.environmentLabel());
        session.setStatus(ImpersonationSessionEntity.STATUS_ACTIVE);
        session.setStartedAt(now);
        session.setExpiresAt(expiresAt);
        session.setActorAccessJti(actor.getJti());
        applyRequestMeta(session);
        sessionRepository.save(session);

        var access = jwtTokenService.generateAccessToken(
                subject.getId(),
                subject.getTenantId(),
                subject.getEmail(),
                subjectRoles,
                subjectPermissions,
                actor.getUserId(),
                session.getId());
        String refresh = refreshTokenService.issueRefreshToken(
                subject.getId(), subject.getTenantId(), "impersonation", session.getId());

        session.setSubjectAccessJti(access.jti());
        sessionRepository.save(session);

        UserEntity actorUser = userRepository.findById(actor.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, "Actor not found"));

        ImpersonationContextResponse context = ImpersonationContextResponse.builder()
                .sessionId(session.getId())
                .environmentLabel(session.getEnvironmentLabel())
                .startedAt(session.getStartedAt())
                .expiresAt(session.getExpiresAt())
                .reason(session.getReason())
                .actor(toParty(actorUser, actorRoles))
                .subject(toParty(subject, subjectRoles))
                .build();

        auditLogService.record(
                actor.getTenantId(),
                subject.getId(),
                "IMPERSONATION_STARTED",
                "ImpersonationSession",
                session.getId(),
                Map.of(
                        "actorUserId", actor.getUserId().toString(),
                        "subjectUserId", subject.getId().toString(),
                        "subjectRoles", subjectRoles,
                        "environment", session.getEnvironmentLabel(),
                        "reason", session.getReason() != null ? session.getReason() : "",
                        "expiresAt", session.getExpiresAt().toString()
                ));

        return ImpersonationStartResponse.builder()
                .accessToken(access.accessToken())
                .refreshToken(refresh)
                .expiresIn(access.expiresInSeconds())
                .tokenType("Bearer")
                .user(userProfileMapper.toResponse(subject, subjectRoles, subjectPermissions))
                .impersonation(context)
                .build();
    }

    @Transactional
    public ImpersonationStartResponse refreshImpersonation(RefreshTokenEntity existing, UserEntity subject) {
        UUID sessionId = existing.getImpersonationSessionId();
        if (sessionId == null) {
            throw ImpersonationExceptions.sessionNotFound();
        }
        ImpersonationSessionEntity session = sessionRepository.findActiveById(sessionId)
                .orElseThrow(ImpersonationExceptions::sessionNotFound);

        if (session.getExpiresAt().isBefore(Instant.now())) {
            endSession(session, "EXPIRED", null);
            throw ImpersonationExceptions.expired();
        }
        if (!eligibility.isEnabled()) {
            endSession(session, "DISABLED", null);
            throw ImpersonationExceptions.disabled();
        }

        List<String> subjectRoles = userRoleRepository.findRoleNamesByUserId(subject.getId());
        List<String> subjectPermissions = permissionRepository.findPermissionCodesByUserId(subject.getId());
        List<String> actorRoles = userRoleRepository.findRoleNamesByUserId(session.getActorUserId());

        var access = jwtTokenService.generateAccessToken(
                subject.getId(),
                subject.getTenantId(),
                subject.getEmail(),
                subjectRoles,
                subjectPermissions,
                session.getActorUserId(),
                session.getId());
        String refresh = refreshTokenService.issueRefreshToken(
                subject.getId(), subject.getTenantId(), existing.getDeviceInfo(), session.getId());

        session.setSubjectAccessJti(access.jti());
        sessionRepository.save(session);

        UserEntity actorUser = userRepository.findById(session.getActorUserId())
                .orElseThrow(ImpersonationExceptions::sessionNotFound);

        return ImpersonationStartResponse.builder()
                .accessToken(access.accessToken())
                .refreshToken(refresh)
                .expiresIn(access.expiresInSeconds())
                .tokenType("Bearer")
                .user(userProfileMapper.toResponse(subject, subjectRoles, subjectPermissions))
                .impersonation(ImpersonationContextResponse.builder()
                        .sessionId(session.getId())
                        .environmentLabel(session.getEnvironmentLabel())
                        .startedAt(session.getStartedAt())
                        .expiresAt(session.getExpiresAt())
                        .reason(session.getReason())
                        .actor(toParty(actorUser, actorRoles))
                        .subject(toParty(subject, subjectRoles))
                        .build())
                .build();
    }

    @Transactional
    public void end(UserPrincipal principal, String endReason) {
        ImpersonationSessionEntity session;
        if (principal.isImpersonating()) {
            session = sessionRepository.findActiveById(principal.getImpersonationSessionId())
                    .orElseThrow(ImpersonationExceptions::sessionNotFound);
            if (!session.getActorUserId().equals(principal.getActorUserId())
                    && !session.getSubjectUserId().equals(principal.getUserId())) {
                throw ImpersonationExceptions.forbidden();
            }
        } else {
            session = sessionRepository.findActiveByActor(principal.getUserId())
                    .orElseThrow(ImpersonationExceptions::sessionNotFound);
            assertPlatformAdmin(principal);
        }

        endSession(session, endReason != null ? endReason : "EXITED", principal.getJti());
    }

    @Transactional(readOnly = true)
    public ImpersonationContextResponse activeContext(UserPrincipal principal) {
        if (!principal.isImpersonating()) {
            return null;
        }
        ImpersonationSessionEntity session = sessionRepository.findActiveById(principal.getImpersonationSessionId())
                .orElse(null);
        if (session == null) {
            return null;
        }
        if (session.getExpiresAt().isBefore(Instant.now())) {
            return null;
        }
        UserEntity actor = userRepository.findById(session.getActorUserId()).orElse(null);
        UserEntity subject = userRepository.findById(session.getSubjectUserId()).orElse(null);
        if (actor == null || subject == null) {
            return null;
        }
        return ImpersonationContextResponse.builder()
                .sessionId(session.getId())
                .environmentLabel(session.getEnvironmentLabel())
                .startedAt(session.getStartedAt())
                .expiresAt(session.getExpiresAt())
                .reason(session.getReason())
                .actor(toParty(actor, userRoleRepository.findRoleNamesByUserId(actor.getId())))
                .subject(toParty(subject, userRoleRepository.findRoleNamesByUserId(subject.getId())))
                .build();
    }

    @Transactional
    public void endIfImpersonatingOnLogout(UserPrincipal principal) {
        if (principal == null || !principal.isImpersonating()) {
            return;
        }
        sessionRepository.findActiveById(principal.getImpersonationSessionId()).ifPresent(session ->
                endSession(session, "LOGOUT", principal.getJti()));
    }

    private void endSession(ImpersonationSessionEntity session, String endReason, String subjectJti) {
        if (!ImpersonationSessionEntity.STATUS_ACTIVE.equals(session.getStatus())) {
            return;
        }
        Instant now = Instant.now();
        session.setStatus("EXPIRED".equals(endReason)
                ? ImpersonationSessionEntity.STATUS_EXPIRED
                : ImpersonationSessionEntity.STATUS_ENDED);
        session.setEndedAt(now);
        session.setEndReason(endReason);
        sessionRepository.save(session);

        refreshTokenService.revokeAllForImpersonationSession(session.getId());
        String jti = subjectJti != null ? subjectJti : session.getSubjectAccessJti();
        if (jti != null) {
            long remaining = Math.max(1, session.getExpiresAt().getEpochSecond() - now.getEpochSecond());
            tokenBlacklistService.blacklist(jti, remaining);
        }

        auditLogService.record(
                session.getTenantId(),
                session.getSubjectUserId(),
                "IMPERSONATION_ENDED",
                "ImpersonationSession",
                session.getId(),
                Map.of(
                        "actorUserId", session.getActorUserId().toString(),
                        "subjectUserId", session.getSubjectUserId().toString(),
                        "endReason", endReason,
                        "environment", session.getEnvironmentLabel()
                ));
    }

    private void validateTarget(UUID actorId, UserEntity subject) {
        if (actorId.equals(subject.getId())) {
            throw ImpersonationExceptions.targetNotAllowed("Cannot impersonate your own account");
        }
        if (!UserStatus.ACTIVE.equals(subject.getStatus())) {
            throw ImpersonationExceptions.targetNotAllowed("Only ACTIVE users can be impersonated");
        }
        if (subject.getLockedUntil() != null && subject.getLockedUntil().isAfter(Instant.now())) {
            throw ImpersonationExceptions.targetNotAllowed("Cannot impersonate a locked user");
        }
        List<String> roles = userRoleRepository.findRoleNamesByUserId(subject.getId());
        if (roles.contains(PLATFORM_ADMIN)) {
            throw ImpersonationExceptions.targetNotAllowed("Cannot impersonate another Platform Administrator");
        }
        if (roles.isEmpty()) {
            throw ImpersonationExceptions.targetNotAllowed("Target user has no application roles");
        }
    }

    private void assertPlatformAdmin(UserPrincipal principal) {
        if (principal.getRoles() == null || !principal.getRoles().contains(PLATFORM_ADMIN)) {
            throw ImpersonationExceptions.forbidden();
        }
        if (!principal.hasPermission("admin:users:impersonate") && !principal.hasPermission("admin:users:write")) {
            throw ImpersonationExceptions.forbidden();
        }
    }

    private ImpersonationPartyResponse toParty(UserEntity user, List<String> roles) {
        return ImpersonationPartyResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .build();
    }

    private String trimReason(String reason) {
        if (reason == null) {
            return null;
        }
        String trimmed = reason.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void applyRequestMeta(ImpersonationSessionEntity session) {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return;
        }
        HttpServletRequest request = attrs.getRequest();
        session.setIpAddress(request.getRemoteAddr());
        String ua = request.getHeader("User-Agent");
        if (ua != null && ua.length() > 500) {
            ua = ua.substring(0, 500);
        }
        session.setUserAgent(ua);
    }
}
