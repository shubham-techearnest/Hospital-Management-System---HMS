package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdMedicationReconciliationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IpdMedicationReconciliationRepository extends JpaRepository<IpdMedicationReconciliationEntity, UUID> {

    List<IpdMedicationReconciliationEntity>
    findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByCompletedAtDesc(UUID tenantId, UUID admissionId);

    boolean existsByTenantIdAndAdmissionIdAndReconTypeAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID admissionId, String reconType, String status);
}
