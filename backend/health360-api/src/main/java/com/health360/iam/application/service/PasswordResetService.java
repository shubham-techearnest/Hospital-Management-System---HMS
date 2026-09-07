package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.iam.infrastructure.persistence.entity.PasswordResetTokenEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.PasswordResetTokenRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.presentation.dto.request.ResetPasswordRequest;
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
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailNotificationService emailNotificationService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;
    private final Health360Properties properties;

    /**
     * Always returns silently for unknown emails (anti-enumeration).
     */
    @Transactional
    public void requestReset(String email, UUID tenantId) {
        userRepository.findByTenantIdAndEmailIgnoreCase(tenantId, email.trim()).ifPresent(user -> {
            String rawToken = HashUtils.newToken();
            PasswordResetTokenEntity token = new PasswordResetTokenEntity();
            token.setUserId(user.getId());
            token.setTokenHash(HashUtils.sha256(rawToken));
            long ttlHours = properties.getAuth().getPasswordResetTtlHours();
            token.setExpiresAt(Instant.now().plusSeconds(Math.max(1, ttlHours) * 3600));
            tokenRepository.save(token);
            emailNotificationService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), rawToken);
            auditLogService.record(tenantId, user.getId(), "PASSWORD_RESET_REQUESTED", "User", user.getId(),
                    Map.of("email", user.getEmail()));
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetTokenEntity token = tokenRepository
                .findByTokenHashAndUsedAtIsNull(HashUtils.sha256(request.getToken().trim()))
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Invalid or expired reset token"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED, HttpStatus.BAD_REQUEST,
                    "Reset token has expired");
        }

        UserEntity user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "User not found"));

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.touch();
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);

        refreshTokenService.revokeAllForUser(user.getId());

        auditLogService.record(user.getTenantId(), user.getId(), "PASSWORD_RESET_COMPLETED", "User", user.getId(),
                Map.of("email", user.getEmail()));
    }
}
