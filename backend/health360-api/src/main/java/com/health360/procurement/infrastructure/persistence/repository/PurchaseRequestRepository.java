package com.health360.procurement.infrastructure.persistence.repository;

import com.health360.procurement.infrastructure.persistence.entity.PurchaseRequestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequestEntity, UUID> {

    Optional<PurchaseRequestEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<PurchaseRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<PurchaseRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);
}
