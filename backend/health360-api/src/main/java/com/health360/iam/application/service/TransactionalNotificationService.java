package com.health360.iam.application.service;

import com.health360.iam.domain.NotificationType;
import com.health360.iam.infrastructure.persistence.entity.InAppNotificationEntity;
import com.health360.iam.infrastructure.persistence.entity.NotificationPreferenceEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.InAppNotificationRepository;
import com.health360.iam.infrastructure.persistence.repository.NotificationPreferenceRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionalNotificationService {

    private static final Set<NotificationType> PUSH_TYPES = Set.of(
            NotificationType.OPD_CALLED,
            NotificationType.OPD_IN_SERVICE,
            NotificationType.OPD_COMPLETED,
            NotificationType.OPD_APPROACHING,
            NotificationType.OPD_DOCTOR_ASSIGNED);

    private final InAppNotificationRepository inAppNotificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;
    private final PushNotificationService pushNotificationService;
    private final SmsNotificationGateway smsNotificationGateway;

    @Transactional
    public void send(
            UUID tenantId,
            UUID userId,
            NotificationType type,
            String title,
            String message,
            String referenceType,
            UUID referenceId) {
        NotificationPreferenceEntity preference = preferenceRepository
                .findByUserIdAndNotificationTypeAndDeletedAtIsNull(userId, type.name())
                .orElse(null);

        boolean emailEnabled = preference == null || preference.isEmailEnabled();
        boolean inAppEnabled = preference == null || preference.isInAppEnabled();
        boolean smsEnabled = preference != null && preference.isSmsEnabled();

        if (inAppEnabled) {
            InAppNotificationEntity notification = new InAppNotificationEntity();
            notification.setTenantId(tenantId);
            notification.setUserId(userId);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType(type.name());
            notification.setReferenceType(referenceType);
            notification.setReferenceId(referenceId);
            inAppNotificationRepository.save(notification);

            if (PUSH_TYPES.contains(type)) {
                pushNotificationService.sendToUser(
                        userId, type, title, message, buildPushData(type, referenceType, referenceId));
            }
        }

        if (emailEnabled || smsEnabled) {
            userRepository.findById(userId).ifPresent(user -> {
                if (emailEnabled) {
                    emailNotificationService.sendTransactionalEmail(user.getEmail(), title, message);
                }
                if (smsEnabled) {
                    String body = title == null || title.isBlank() ? message : title + ": " + message;
                    smsNotificationGateway.send(user.getPhone(), body);
                }
            });
        }
    }

    @Transactional(readOnly = true)
    public UserEntity requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
    }

    private Map<String, String> buildPushData(
            NotificationType type, String referenceType, UUID referenceId) {
        Map<String, String> data = new LinkedHashMap<>();
        data.put("screen", "opd");
        data.put("notificationType", type.name());
        if (referenceType != null) {
            data.put("referenceType", referenceType);
        }
        if (referenceId != null) {
            data.put("referenceId", referenceId.toString());
        }
        return data;
    }
}
