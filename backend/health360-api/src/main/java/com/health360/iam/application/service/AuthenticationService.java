package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.RefreshTokenEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.PermissionRepository;
import com.health360.iam.infrastructure.persistence.repository.RefreshTokenRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.iam.presentation.dto.request.LoginRequest;
import com.health360.iam.presentation.dto.response.AuthTokenResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.util.HashUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuditLogService auditLogService;
    private final UserProfileMapper userProfileMapper;
    private final Health360Properties properties;
    private final HospitalRepository hospitalRepository;

    @Transactional
    public AuthTokenResponse login(LoginRequest request) {
        UUID tenantId = properties.getDefaultTenantId();
        UserEntity user = userRepository.findByTenantIdAndEmailIgnoreCase(tenantId, request.getEmail().trim())
                .orElseThrow(() -> invalidCredentials());

        if (UserStatus.DEACTIVATED.equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.ACCOUNT_DEACTIVATED, HttpStatus.FORBIDDEN,
                    "Account has been deactivated");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED, HttpStatus.LOCKED,
                    "Account is locked until " + user.getLockedUntil());
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            registerFailedAttempt(user);
            throw invalidCredentials();
        }

        if (!user.isEmailVerified() || !UserStatus.ACTIVE.equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED, HttpStatus.FORBIDDEN,
                    "Please verify your email before logging in");
        }

        assertHospitalNotSuspended(user);

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.touch();
        userRepository.save(user);

        return issueTokenPair(user, request.getDeviceInfo());
    }

    @Transactional
    public AuthTokenResponse refresh(String rawRefreshToken) {
        String hash = HashUtils.sha256(rawRefreshToken);
        RefreshTokenEntity existing = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED,
                        "Invalid or expired refresh token"));

        if (existing.isRevoked()) {
            refreshTokenService.revokeAllForUser(existing.getUserId());
            throw new BusinessException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED,
                    "Refresh token reuse detected");
        }

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED,
                    "Refresh token has expired");
        }

        UserEntity user = userRepository.findById(existing.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED,
                        "User not found"));

        refreshTokenService.rotateToken(existing);
        return issueTokenPair(user, existing.getDeviceInfo());
    }

    @Transactional
    public void logout(UUID userId, String accessTokenJti, long accessTokenRemainingSeconds, String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revokeToken(refreshToken);
        } else {
            refreshTokenService.revokeAllForUser(userId);
        }
        if (accessTokenJti != null) {
            tokenBlacklistService.blacklist(accessTokenJti, accessTokenRemainingSeconds);
        }
        auditLogService.record(properties.getDefaultTenantId(), userId, "USER_LOGOUT", "User", userId, null);
    }

    private AuthTokenResponse issueTokenPair(UserEntity user, String deviceInfo) {
        List<String> roles = userRoleRepository.findRoleNamesByUserId(user.getId());
        List<String> permissions = permissionRepository.findPermissionCodesByUserId(user.getId());

        var access = jwtTokenService.generateAccessToken(
                user.getId(), user.getTenantId(), user.getEmail(), roles, permissions);
        String refresh = refreshTokenService.issueRefreshToken(user.getId(), user.getTenantId(), deviceInfo);

        auditLogService.record(user.getTenantId(), user.getId(), "USER_LOGIN", "User", user.getId(),
                Map.of("email", user.getEmail()));

        return AuthTokenResponse.builder()
                .accessToken(access.accessToken())
                .refreshToken(refresh)
                .expiresIn(access.expiresInSeconds())
                .tokenType("Bearer")
                .user(userProfileMapper.toResponse(user, roles, permissions))
                .build();
    }

    private void registerFailedAttempt(UserEntity user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= properties.getAuth().getMaxFailedLoginAttempts()) {
            user.setStatus(UserStatus.LOCKED);
            user.setLockedUntil(Instant.now().plusSeconds(
                    properties.getAuth().getLockoutDurationMinutes() * 60));
        }
        user.touch();
        userRepository.save(user);
    }

    private BusinessException invalidCredentials() {
        return new BusinessException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                "Invalid email or password");
    }

    private void assertHospitalNotSuspended(UserEntity user) {
        List<String> roles = userRoleRepository.findRoleNamesByUserId(user.getId());
        if (!roles.contains("HOSPITAL_ADMIN")) {
            return;
        }
        hospitalRepository.findByTenantIdAndAdminUserIdAndDeletedAtIsNull(user.getTenantId(), user.getId())
                .filter(h -> "SUSPENDED".equals(h.getStatus()))
                .ifPresent(h -> {
                    throw new BusinessException(ErrorCode.HOSPITAL_SUSPENDED, HttpStatus.FORBIDDEN,
                            "This hospital account has been suspended. Contact platform support.");
                });
    }
}
