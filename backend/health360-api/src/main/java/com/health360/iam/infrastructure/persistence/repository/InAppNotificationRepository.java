package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.InAppNotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InAppNotificationRepository extends JpaRepository<InAppNotificationEntity, UUID> {
}
