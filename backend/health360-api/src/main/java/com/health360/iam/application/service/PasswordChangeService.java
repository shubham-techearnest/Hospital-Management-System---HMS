package com.health360.iam.application.service;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.presentation.dto.request.ChangePasswordRequest;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordChangeService {

    private final UserRepository userRepository;
    private final UserAccountService userAccountService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuditLogService auditLogService;

    @Transactional
    public void changePassword(UUID userId, UUID tenantId, String accessTokenJti, long accessTokenRemainingSeconds,
                               ChangePasswordRequest request) {
        UserEntity user = userAccountService.requireUser(userId, tenantId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST,
                    "Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.touch();
        userRepository.save(user);

        refreshTokenService.revokeAllForUser(userId);
        if (accessTokenJti != null) {
            tokenBlacklistService.blacklist(accessTokenJti, accessTokenRemainingSeconds);
        }

        auditLogService.record(tenantId, userId, "PASSWORD_CHANGED", "User", userId,
                Map.of("email", user.getEmail()));
    }
}
