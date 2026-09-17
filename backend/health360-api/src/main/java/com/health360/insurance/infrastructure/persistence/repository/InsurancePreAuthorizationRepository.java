package com.health360.insurance.infrastructure.persistence.repository;

import com.health360.insurance.infrastructure.persistence.entity.InsurancePreAuthorizationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InsurancePreAuthorizationRepository extends JpaRepository<InsurancePreAuthorizationEntity, UUID> {

    Optional<InsurancePreAuthorizationEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<InsurancePreAuthorizationEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<InsurancePreAuthorizationEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);
}
