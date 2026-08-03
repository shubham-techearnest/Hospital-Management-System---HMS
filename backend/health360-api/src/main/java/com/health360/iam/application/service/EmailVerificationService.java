package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.EmailVerificationTokenEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.EmailVerificationTokenRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.util.HashUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailNotificationService emailNotificationService;
    private final AuditLogService auditLogService;
    private final Health360Properties properties;

    @Transactional
    public void createAndSendVerificationToken(UserEntity user) {
        String rawToken = HashUtils.newToken();
        EmailVerificationTokenEntity token = new EmailVerificationTokenEntity();
        token.setUserId(user.getId());
        token.setTokenHash(HashUtils.sha256(rawToken));
        token.setExpiresAt(Instant.now().plusSeconds(properties.getAuth().getEmailVerificationTtlHours() * 3600));
        tokenRepository.save(token);
        emailNotificationService.sendVerificationEmail(user.getEmail(), user.getFirstName(), rawToken);
    }

    @Transactional
    public void verifyEmail(String rawToken) {
        EmailVerificationTokenEntity token = tokenRepository
                .findByTokenHashAndUsedAtIsNull(HashUtils.sha256(rawToken))
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Invalid or expired verification token"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED, HttpStatus.BAD_REQUEST,
                    "Verification token has expired");
        }

        UserEntity user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "User not found"));

        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());
        user.setStatus(UserStatus.ACTIVE);
        user.touch();
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);

        auditLogService.record(user.getTenantId(), user.getId(), "EMAIL_VERIFIED", "User", user.getId(),
                Map.of("email", user.getEmail()));
    }

    @Transactional
    public void resendVerification(String email, UUID tenantId) {
        UserEntity user = userRepository.findByTenantIdAndEmailIgnoreCase(tenantId, email)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "User not found"));

        if (user.isEmailVerified()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Email is already verified");
        }

        createAndSendVerificationToken(user);
    }
}
