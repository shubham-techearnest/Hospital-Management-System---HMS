package com.health360.inventory.infrastructure.persistence.repository;

import com.health360.inventory.infrastructure.persistence.entity.InventoryItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItemEntity, UUID> {

    Optional<InventoryItemEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<InventoryItemEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<InventoryItemEntity> findByTenantIdAndHospitalIdAndBranchIdAndCategoryAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId, String category, Pageable pageable);

    boolean existsByTenantIdAndHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String code);
}
