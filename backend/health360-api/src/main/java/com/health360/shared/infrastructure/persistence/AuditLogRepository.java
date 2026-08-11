package com.health360.shared.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {

    Page<AuditLogEntity> findByTenantIdOrderByOccurredAtDesc(UUID tenantId, Pageable pageable);

    Page<AuditLogEntity> findByTenantIdAndActionContainingIgnoreCaseOrderByOccurredAtDesc(
            UUID tenantId, String action, Pageable pageable);

    Page<AuditLogEntity> findByTenantIdAndEntityTypeAndEntityIdOrderByOccurredAtDesc(
            UUID tenantId, String entityType, UUID entityId, Pageable pageable);
}
