package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.NotificationPreferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreferenceEntity, UUID> {

    List<NotificationPreferenceEntity> findByUserIdAndDeletedAtIsNullOrderByNotificationType(UUID userId);

    Optional<NotificationPreferenceEntity> findByUserIdAndNotificationTypeAndDeletedAtIsNull(
            UUID userId, String notificationType);
}
