package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PharmacyRequestRepository extends JpaRepository<PharmacyRequestEntity, UUID> {

    Optional<PharmacyRequestEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<PharmacyRequestEntity> findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID patientId);

    List<PharmacyRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    List<PharmacyRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);

    Optional<PharmacyRequestEntity> findByPrescriptionIdAndDeletedAtIsNullAndStatusNot(
            UUID prescriptionId, String status);

    long countByTenantIdAndRequestedAtGreaterThanEqualAndDeletedAtIsNull(UUID tenantId, java.time.Instant from);
}
