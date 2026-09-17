package com.health360.asset.infrastructure.persistence.repository;

import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetMaintenanceScheduleRepository extends JpaRepository<AssetMaintenanceScheduleEntity, UUID> {

    Optional<AssetMaintenanceScheduleEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<AssetMaintenanceScheduleEntity> findByTenantIdAndAssetIdAndDeletedAtIsNullOrderByNextDueAtAsc(
            UUID tenantId, UUID assetId);

    List<AssetMaintenanceScheduleEntity> findByTenantIdAndHospitalIdAndBranchIdAndActiveTrueAndDeletedAtIsNullAndNextDueAtLessThanEqualOrderByNextDueAtAsc(
            UUID tenantId, UUID hospitalId, UUID branchId, Instant dueBefore);
}
