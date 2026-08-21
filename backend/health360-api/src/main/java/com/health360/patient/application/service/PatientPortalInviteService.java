package com.health360.patient.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.entity.PortalInviteTokenEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.infrastructure.persistence.repository.PortalInviteTokenRepository;
import com.health360.patient.presentation.dto.request.CompletePortalAccountRequest;
import com.health360.patient.presentation.dto.response.PortalInviteResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.util.HashUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientPortalInviteService {

    private static final int INVITE_TTL_DAYS = 7;

    private final PortalInviteTokenRepository inviteTokenRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Value("${health360.app-base-url:http://localhost:5173}")
    private String appBaseUrl;

    @Transactional
    public PortalInviteResponse createInvite(UserPrincipal principal, UUID patientId) {
        if (!principal.hasPermission("patient:registry:write")
                && !principal.hasPermission("patient:registry:read")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }

        PatientProfileEntity profile = patientProfileRepository.findById(patientId)
                .filter(p -> p.getDeletedAt() == null && p.getTenantId().equals(principal.getTenantId()))
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Patient not found"));

        UserEntity user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Linked user not found"));

        if (UserStatus.ACTIVE.equals(user.getStatus()) && user.isEmailVerified()
                && user.getEmail() != null
                && !user.getEmail().toLowerCase().endsWith("@patient.health360.local")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Patient already has an active portal account");
        }

        String rawToken = HashUtils.newToken();
        PortalInviteTokenEntity token = new PortalInviteTokenEntity();
        token.setTenantId(principal.getTenantId());
        token.setPatientId(profile.getId());
        token.setUserId(user.getId());
        token.setTokenHash(HashUtils.sha256(rawToken));
        token.setExpiresAt(Instant.now().plus(INVITE_TTL_DAYS, ChronoUnit.DAYS));
        token.setCreatedBy(principal.getUserId());
        inviteTokenRepository.save(token);

        String inviteLink = appBaseUrl + "/complete-patient-account?token=" + rawToken;
        log.info("""
                ===== PATIENT PORTAL INVITE (SMS deferred — copy from logs) =====
                patientId={}
                uhid={}
                phone={}
                inviteLink={}
                expiresAt={}
                =================================================================
                """, profile.getId(), profile.getUhid(), profile.getPrimaryPhone(), inviteLink, token.getExpiresAt());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PATIENT_PORTAL_INVITE_CREATED",
                "PatientProfile", profile.getId(),
                Map.of("uhid", profile.getUhid() != null ? profile.getUhid() : "",
                        "phone", profile.getPrimaryPhone() != null ? profile.getPrimaryPhone() : ""));

        return PortalInviteResponse.builder()
                .patientId(profile.getId())
                .uhid(profile.getUhid())
                .primaryPhone(profile.getPrimaryPhone())
                .inviteLink(inviteLink)
                .message("Invite link logged server-side. SMS not configured — copy inviteLink from response or logs.")
                .build();
    }

    @Transactional
    public void completeAccount(CompletePortalAccountRequest request) {
        PortalInviteTokenEntity token = inviteTokenRepository
                .findByTokenHashAndUsedAtIsNull(HashUtils.sha256(request.getToken().trim()))
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid or used invite token"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invite token has expired");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByTenantIdAndEmailIgnoreCase(token.getTenantId(), email).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Email already registered");
        }

        UserEntity user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "User not found"));

        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setUpdatedBy(user.getId());
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        inviteTokenRepository.save(token);

        auditLogService.record(token.getTenantId(), user.getId(), "PATIENT_PORTAL_ACCOUNT_ACTIVATED",
                "PatientProfile", token.getPatientId(), Map.of("email", email));

        log.info("Patient portal account activated patientId={} email={}", token.getPatientId(), email);
    }
}
