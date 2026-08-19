package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.MedicationOrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicationOrderRepository extends JpaRepository<MedicationOrderEntity, UUID> {

    Optional<MedicationOrderEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<MedicationOrderEntity> findByClinicalOrderIdAndDeletedAtIsNull(UUID clinicalOrderId);

    Page<MedicationOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<MedicationOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);

    @Query("""
            SELECT o FROM ClinicalOrderEntity o
            JOIN EncounterEntity e ON e.id = o.encounterId
            WHERE o.tenantId = :tenantId
              AND o.orderType = 'MEDICATION'
              AND o.status = 'ORDERED'
              AND o.deletedAt IS NULL
              AND e.hospitalId = :hospitalId
              AND e.branchId = :branchId
              AND NOT EXISTS (
                  SELECT 1 FROM MedicationOrderEntity mo
                  WHERE mo.clinicalOrderId = o.id AND mo.deletedAt IS NULL
              )
            ORDER BY o.orderedAt DESC
            """)
    List<ClinicalOrderEntity> findPendingMedicationOrders(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
