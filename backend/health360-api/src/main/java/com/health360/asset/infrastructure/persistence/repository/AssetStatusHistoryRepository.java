package com.health360.asset.infrastructure.persistence.repository;

import com.health360.asset.infrastructure.persistence.entity.AssetStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetStatusHistoryRepository extends JpaRepository<AssetStatusHistoryEntity, UUID> {

    List<AssetStatusHistoryEntity> findByAssetIdAndDeletedAtIsNullOrderByChangedAtDesc(UUID assetId);
}
