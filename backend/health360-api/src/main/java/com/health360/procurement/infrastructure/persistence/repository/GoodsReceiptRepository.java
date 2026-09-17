package com.health360.procurement.infrastructure.persistence.repository;

import com.health360.procurement.infrastructure.persistence.entity.GoodsReceiptEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GoodsReceiptRepository extends JpaRepository<GoodsReceiptEntity, UUID> {

    Optional<GoodsReceiptEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<GoodsReceiptEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);
}
