package com.health360.radiology.infrastructure.persistence.repository;

import com.health360.radiology.infrastructure.persistence.entity.ImagingOrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ImagingOrderRepository extends JpaRepository<ImagingOrderEntity, UUID> {

    Optional<ImagingOrderEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<ImagingOrderEntity> findByClinicalOrderItemIdAndDeletedAtIsNull(UUID clinicalOrderItemId);

    Page<ImagingOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<ImagingOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);

    @Query("""
            SELECT i FROM ClinicalOrderItemEntity i
            JOIN ClinicalOrderEntity o ON o.id = i.orderId
            JOIN EncounterEntity e ON e.id = o.encounterId
            WHERE i.tenantId = :tenantId
              AND o.orderType = 'IMAGING'
              AND i.status = 'ORDERED'
              AND i.deletedAt IS NULL
              AND o.deletedAt IS NULL
              AND e.hospitalId = :hospitalId
              AND e.branchId = :branchId
              AND NOT EXISTS (
                  SELECT 1 FROM ImagingOrderEntity io
                  WHERE io.clinicalOrderItemId = i.id AND io.deletedAt IS NULL
              )
            ORDER BY o.orderedAt DESC
            """)
    List<com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity> findPendingImagingItems(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
