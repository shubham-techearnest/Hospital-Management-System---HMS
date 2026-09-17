package com.health360.insurance.infrastructure.persistence.repository;

import com.health360.insurance.infrastructure.persistence.entity.InsuranceClaimEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaimEntity, UUID> {

    Optional<InsuranceClaimEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<InsuranceClaimEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<InsuranceClaimEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);
}
