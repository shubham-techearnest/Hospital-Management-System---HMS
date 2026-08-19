package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OtProcedureEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OtProcedureRepository extends JpaRepository<OtProcedureEntity, UUID> {

    Optional<OtProcedureEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<OtProcedureEntity> findByClinicalOrderItemIdAndDeletedAtIsNull(UUID clinicalOrderItemId);

    Page<OtProcedureEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<OtProcedureEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);

    List<OtProcedureEntity> findByTenantIdAndEncounterIdAndStatusAndDeletedAtIsNullOrderByCompletedAtDesc(
            UUID tenantId, UUID encounterId, String status);

    @Query("""
            SELECT i FROM ClinicalOrderItemEntity i
            JOIN ClinicalOrderEntity o ON o.id = i.orderId
            JOIN EncounterEntity e ON e.id = o.encounterId
            WHERE i.tenantId = :tenantId
              AND o.orderType = 'PROCEDURE'
              AND i.status = 'ORDERED'
              AND i.deletedAt IS NULL
              AND o.deletedAt IS NULL
              AND e.hospitalId = :hospitalId
              AND e.branchId = :branchId
              AND NOT EXISTS (
                  SELECT 1 FROM OtProcedureEntity p
                  WHERE p.clinicalOrderItemId = i.id AND p.deletedAt IS NULL
              )
            ORDER BY o.orderedAt DESC
            """)
    List<com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity> findPendingProcedureItems(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
