package com.health360.insurance.infrastructure.persistence.repository;

import com.health360.insurance.infrastructure.persistence.entity.InsurancePolicyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicyEntity, UUID> {

    Optional<InsurancePolicyEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<InsurancePolicyEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<InsurancePolicyEntity> findByTenantIdAndHospitalIdAndBranchIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, UUID patientId, Pageable pageable);

    boolean existsByHospitalIdAndPayerIdAndPolicyNumberAndDeletedAtIsNull(
            UUID hospitalId, UUID payerId, String policyNumber);
}
