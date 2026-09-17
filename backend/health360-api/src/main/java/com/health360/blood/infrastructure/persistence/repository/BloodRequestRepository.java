package com.health360.blood.infrastructure.persistence.repository;

import com.health360.blood.infrastructure.persistence.entity.BloodRequestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface BloodRequestRepository extends JpaRepository<BloodRequestEntity, UUID> {

    Optional<BloodRequestEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<BloodRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<BloodRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, Collection<String> statuses);
}
