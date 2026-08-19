package com.health360.laboratory.infrastructure.persistence.repository;

import com.health360.laboratory.infrastructure.persistence.entity.LabOrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LabOrderRepository extends JpaRepository<LabOrderEntity, UUID> {

    Optional<LabOrderEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<LabOrderEntity> findByClinicalOrderItemIdAndDeletedAtIsNull(UUID clinicalOrderItemId);

    Page<LabOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<LabOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);

    @Query("""
            SELECT i FROM ClinicalOrderItemEntity i
            JOIN ClinicalOrderEntity o ON o.id = i.orderId
            JOIN EncounterEntity e ON e.id = o.encounterId
            WHERE i.tenantId = :tenantId
              AND o.orderType = 'LAB'
              AND i.status = 'ORDERED'
              AND i.deletedAt IS NULL
              AND o.deletedAt IS NULL
              AND e.hospitalId = :hospitalId
              AND e.branchId = :branchId
              AND NOT EXISTS (
                  SELECT 1 FROM LabOrderEntity lo
                  WHERE lo.clinicalOrderItemId = i.id AND lo.deletedAt IS NULL
              )
            ORDER BY o.orderedAt DESC
            """)
    List<com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity> findPendingLabItems(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
