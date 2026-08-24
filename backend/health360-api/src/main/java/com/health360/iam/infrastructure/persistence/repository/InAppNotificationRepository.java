package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.InAppNotificationEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InAppNotificationRepository extends JpaRepository<InAppNotificationEntity, UUID> {

    List<InAppNotificationEntity> findByTenantIdAndUserIdOrderByCreatedAtDesc(
            UUID tenantId, UUID userId, Pageable pageable);

    Optional<InAppNotificationEntity> findByIdAndTenantIdAndUserId(UUID id, UUID tenantId, UUID userId);
}
