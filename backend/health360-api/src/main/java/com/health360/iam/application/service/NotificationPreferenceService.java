package com.health360.iam.application.service;

import com.health360.iam.domain.NotificationType;
import com.health360.iam.infrastructure.persistence.entity.NotificationPreferenceEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.NotificationPreferenceRepository;
import com.health360.iam.presentation.dto.request.NotificationPreferenceItemRequest;
import com.health360.iam.presentation.dto.response.NotificationPreferenceResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserAccountService userAccountService;
    private final AuditLogService auditLogService;

    @Transactional
    public void seedDefaultsForUser(UserEntity user) {
        for (NotificationType type : NotificationType.values()) {
            NotificationPreferenceEntity preference = new NotificationPreferenceEntity();
            preference.setTenantId(user.getTenantId());
            preference.setUserId(user.getId());
            preference.setNotificationType(type.name());
            preference.setEmailEnabled(true);
            preference.setSmsEnabled(isSmsConfigurable(type));
            preference.setInAppEnabled(true);
            preferenceRepository.save(preference);
        }
    }

    @Transactional
    public List<NotificationPreferenceResponse> getPreferences(UUID userId, UUID tenantId) {
        UserEntity user = userAccountService.requireUser(userId, tenantId);
        List<NotificationPreferenceEntity> existing =
                preferenceRepository.findByUserIdAndDeletedAtIsNullOrderByNotificationType(userId);
        if (existing.isEmpty()) {
            seedDefaultsForUser(user);
            existing = preferenceRepository.findByUserIdAndDeletedAtIsNullOrderByNotificationType(userId);
        }
        return existing.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<NotificationPreferenceResponse> updatePreferences(
            UUID userId, UUID tenantId, List<NotificationPreferenceItemRequest> items) {
        userAccountService.requireUser(userId, tenantId);

        for (NotificationPreferenceItemRequest item : items) {
            NotificationType type = parseType(item.getNotificationType());
            NotificationPreferenceEntity preference = preferenceRepository
                    .findByUserIdAndNotificationTypeAndDeletedAtIsNull(userId, type.name())
                    .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                            "Unknown notification type: " + item.getNotificationType()));

            preference.setEmailEnabled(Boolean.TRUE.equals(item.getEmailEnabled()));
            preference.setSmsEnabled(isSmsConfigurable(type) && Boolean.TRUE.equals(item.getSmsEnabled()));
            preference.setInAppEnabled(true);
            preference.touch();
            preferenceRepository.save(preference);
        }

        auditLogService.record(tenantId, userId, "NOTIFICATION_PREFERENCES_UPDATED", "User", userId, null);
        return getPreferences(userId, tenantId);
    }

    private NotificationType parseType(String rawType) {
        try {
            return NotificationType.valueOf(rawType);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Unknown notification type: " + rawType);
        }
    }

    private boolean isSmsConfigurable(NotificationType type) {
        return Arrays.asList(
                NotificationType.APPOINTMENT_CONFIRMATION,
                NotificationType.APPOINTMENT_REMINDER_24H,
                NotificationType.APPOINTMENT_REMINDER_1H,
                NotificationType.APPOINTMENT_CANCELLATION
        ).contains(type);
    }

    private NotificationPreferenceResponse toResponse(NotificationPreferenceEntity entity) {
        return NotificationPreferenceResponse.builder()
                .notificationType(entity.getNotificationType())
                .emailEnabled(entity.isEmailEnabled())
                .smsEnabled(entity.isSmsEnabled())
                .inAppEnabled(entity.isInAppEnabled())
                .build();
    }
}
