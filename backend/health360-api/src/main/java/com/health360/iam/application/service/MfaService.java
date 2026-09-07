package com.health360.iam.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.infrastructure.persistence.entity.MfaBackupCodeEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.MfaBackupCodeRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.presentation.dto.request.MfaDisableRequest;
import com.health360.iam.presentation.dto.request.MfaEnableRequest;
import com.health360.iam.presentation.dto.response.MfaEnableResponse;
import com.health360.iam.presentation.dto.response.MfaSetupResponse;
import com.health360.iam.presentation.dto.response.MfaStatusResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaService {

    private static final String ISSUER = "Health360";
    private static final int BACKUP_CODE_COUNT = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final MfaBackupCodeRepository backupCodeRepository;
    private final TotpService totpService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public MfaStatusResponse status(UserPrincipal principal) {
        UserEntity user = requireUser(principal);
        return MfaStatusResponse.builder()
                .enabled(user.isMfaEnabled())
                .setupPending(user.getMfaPendingSecret() != null && !user.isMfaEnabled())
                .build();
    }

    @Transactional
    public MfaSetupResponse setup(UserPrincipal principal) {
        UserEntity user = requireUser(principal);
        if (user.isMfaEnabled()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "MFA is already enabled. Disable it first to reconfigure.");
        }
        String secret = totpService.generateSecret();
        user.setMfaPendingSecret(secret);
        user.setUpdatedBy(principal.getUserId());
        user.touch();
        userRepository.save(user);

        return MfaSetupResponse.builder()
                .secret(secret)
                .otpAuthUri(totpService.buildOtpAuthUri(ISSUER, user.getEmail(), secret))
                .issuer(ISSUER)
                .build();
    }

    @Transactional
    public MfaEnableResponse enable(UserPrincipal principal, MfaEnableRequest request) {
        UserEntity user = requireUser(principal);
        String pending = user.getMfaPendingSecret();
        if (pending == null || pending.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Start MFA setup before enabling");
        }
        if (!totpService.verifyCode(pending, request.getCode())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                    "Invalid authenticator code");
        }

        user.setMfaSecret(pending);
        user.setMfaPendingSecret(null);
        user.setMfaEnabled(true);
        user.setMfaEnabledAt(Instant.now());
        user.setUpdatedBy(principal.getUserId());
        user.touch();
        userRepository.save(user);

        invalidateBackupCodes(user.getId());
        List<String> plainCodes = new ArrayList<>();
        for (int i = 0; i < BACKUP_CODE_COUNT; i++) {
            String code = formatBackupCode(RANDOM.nextInt(100_000_000));
            plainCodes.add(code);
            MfaBackupCodeEntity entity = new MfaBackupCodeEntity();
            entity.setTenantId(user.getTenantId());
            entity.setUserId(user.getId());
            entity.setCodeHash(passwordEncoder.encode(code));
            entity.setCreatedBy(principal.getUserId());
            entity.setUpdatedBy(principal.getUserId());
            backupCodeRepository.save(entity);
        }

        auditLogService.record(user.getTenantId(), user.getId(), "MFA_ENABLED", "User", user.getId(), Map.of());
        return MfaEnableResponse.builder().enabled(true).backupCodes(plainCodes).build();
    }

    @Transactional
    public void disable(UserPrincipal principal, MfaDisableRequest request) {
        UserEntity user = requireUser(principal);
        if (!user.isMfaEnabled()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "MFA is not enabled");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                    "Invalid password");
        }
        if (!verifyTotpOrBackup(user, request.getCode())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                    "Invalid authenticator or backup code");
        }

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        user.setMfaPendingSecret(null);
        user.setMfaEnabledAt(null);
        user.setUpdatedBy(principal.getUserId());
        user.touch();
        userRepository.save(user);
        invalidateBackupCodes(user.getId());

        auditLogService.record(user.getTenantId(), user.getId(), "MFA_DISABLED", "User", user.getId(), Map.of());
    }

    public boolean verifyTotpOrBackup(UserEntity user, String code) {
        if (user.getMfaSecret() != null && totpService.verifyCode(user.getMfaSecret(), code)) {
            return true;
        }
        String normalized = code == null ? "" : code.trim().replace("-", "").replace(" ", "");
        if (normalized.isEmpty()) {
            return false;
        }
        List<MfaBackupCodeEntity> unused = backupCodeRepository
                .findByUserIdAndUsedAtIsNullAndDeletedAtIsNull(user.getId());
        for (MfaBackupCodeEntity backup : unused) {
            if (passwordEncoder.matches(normalized, backup.getCodeHash())) {
                backup.setUsedAt(Instant.now());
                backup.touch();
                backupCodeRepository.save(backup);
                return true;
            }
        }
        return false;
    }

    private void invalidateBackupCodes(UUID userId) {
        for (MfaBackupCodeEntity code : backupCodeRepository.findByUserIdAndUsedAtIsNullAndDeletedAtIsNull(userId)) {
            code.setDeletedAt(Instant.now());
            code.touch();
            backupCodeRepository.save(code);
        }
    }

    private UserEntity requireUser(UserPrincipal principal) {
        UserEntity user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "User not found"));
        if (!user.getTenantId().equals(principal.getTenantId()) || user.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "User not found");
        }
        return user;
    }

    private static String formatBackupCode(int value) {
        return String.format(Locale.ROOT, "%08d", Math.floorMod(value, 100_000_000));
    }
}
