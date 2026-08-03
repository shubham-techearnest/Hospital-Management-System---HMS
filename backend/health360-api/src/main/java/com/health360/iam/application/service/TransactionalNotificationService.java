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

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionalNotificationService {

    private final InAppNotificationRepository inAppNotificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

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
        }

        if (emailEnabled || smsEnabled) {
            userRepository.findById(userId).ifPresent(user -> {
                if (emailEnabled) {
                    emailNotificationService.sendTransactionalEmail(user.getEmail(), title, message);
                }
                if (smsEnabled) {
                    log.info("SMS notification [{}] to user {}: {}", type, userId, message);
                }
            });
        }
    }

    @Transactional(readOnly = true)
    public UserEntity requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
    }
}
