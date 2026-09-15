package com.health360.asset.infrastructure.persistence.repository;

import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetMaintenanceLogRepository extends JpaRepository<AssetMaintenanceLogEntity, UUID> {

    List<AssetMaintenanceLogEntity> findByTenantIdAndAssetIdAndDeletedAtIsNullOrderByPerformedAtDesc(
            UUID tenantId, UUID assetId);
}
