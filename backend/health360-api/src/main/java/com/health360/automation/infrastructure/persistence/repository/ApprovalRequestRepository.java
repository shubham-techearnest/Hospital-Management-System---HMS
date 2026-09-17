package com.health360.automation.infrastructure.persistence.repository;

import com.health360.automation.infrastructure.persistence.entity.ApprovalRequestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequestEntity, UUID> {

    Page<ApprovalRequestEntity> findByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, String status, Pageable pageable);

    Page<ApprovalRequestEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, Pageable pageable);

    List<ApprovalRequestEntity> findByTenantIdAndEntityTypeAndEntityIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, String entityType, UUID entityId, String status);

    long countByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, String status);
}
