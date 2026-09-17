package com.health360.staffops.infrastructure.persistence.repository;

import com.health360.staffops.infrastructure.persistence.entity.StaffLeaveRequestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StaffLeaveRequestRepository extends JpaRepository<StaffLeaveRequestEntity, UUID> {

    Optional<StaffLeaveRequestEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<StaffLeaveRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<StaffLeaveRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);
}
