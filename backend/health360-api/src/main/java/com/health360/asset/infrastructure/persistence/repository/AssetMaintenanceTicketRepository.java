package com.health360.asset.infrastructure.persistence.repository;

import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceTicketEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetMaintenanceTicketRepository extends JpaRepository<AssetMaintenanceTicketEntity, UUID> {

    Optional<AssetMaintenanceTicketEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<AssetMaintenanceTicketEntity> findByTenantIdAndAssetIdAndDeletedAtIsNullOrderByOpenedAtDesc(
            UUID tenantId, UUID assetId);

    Page<AssetMaintenanceTicketEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByOpenedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<AssetMaintenanceTicketEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByOpenedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    boolean existsByAssetIdAndTicketTypeAndStatusInAndDeletedAtIsNull(
            UUID assetId, String ticketType, List<String> statuses);
}
