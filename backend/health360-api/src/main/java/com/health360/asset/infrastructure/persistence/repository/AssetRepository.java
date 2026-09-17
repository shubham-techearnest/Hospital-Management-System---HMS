package com.health360.asset.infrastructure.persistence.repository;

import com.health360.asset.infrastructure.persistence.entity.AssetEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AssetRepository extends JpaRepository<AssetEntity, UUID> {

    Optional<AssetEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndBranchIdAndAssetTagAndDeletedAtIsNull(
            UUID hospitalId, UUID branchId, String assetTag);

    boolean existsByHospitalIdAndBranchIdAndAssetTagAndIdNotAndDeletedAtIsNull(
            UUID hospitalId, UUID branchId, String assetTag, UUID id);

    Optional<AssetEntity> findByTenantIdAndHospitalIdAndQrPayloadAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, String qrPayload);

    Optional<AssetEntity> findByTenantIdAndHospitalIdAndBranchIdAndAssetTagAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String assetTag);

    @Query("""
            SELECT a FROM AssetEntity a
            WHERE a.tenantId = :tenantId
              AND a.hospitalId = :hospitalId
              AND a.branchId = :branchId
              AND a.deletedAt IS NULL
              AND (:status IS NULL OR a.status = :status)
              AND (:categoryId IS NULL OR a.categoryId = :categoryId)
              AND (:q IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(a.serialNumber, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(a.qrPayload, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY a.updatedAt DESC
            """)
    Page<AssetEntity> search(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("status") String status,
            @Param("categoryId") UUID categoryId,
            @Param("q") String q,
            Pageable pageable);
}
