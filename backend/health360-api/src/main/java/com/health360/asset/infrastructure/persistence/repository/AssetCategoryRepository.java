package com.health360.asset.infrastructure.persistence.repository;

import com.health360.asset.infrastructure.persistence.entity.AssetCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetCategoryRepository extends JpaRepository<AssetCategoryEntity, UUID> {

    List<AssetCategoryEntity> findByTenantIdAndActiveTrueAndDeletedAtIsNullOrderByNameAsc(UUID tenantId);

    Optional<AssetCategoryEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<AssetCategoryEntity> findByTenantIdAndCodeAndDeletedAtIsNull(UUID tenantId, String code);
}
