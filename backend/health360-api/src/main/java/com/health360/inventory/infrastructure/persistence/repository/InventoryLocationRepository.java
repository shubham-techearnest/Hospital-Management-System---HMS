package com.health360.inventory.infrastructure.persistence.repository;

import com.health360.inventory.infrastructure.persistence.entity.InventoryLocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryLocationRepository extends JpaRepository<InventoryLocationEntity, UUID> {

    Optional<InventoryLocationEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<InventoryLocationEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    Optional<InventoryLocationEntity> findByTenantIdAndHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String code);
}
