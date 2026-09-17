package com.health360.staffops.infrastructure.persistence.repository;

import com.health360.staffops.infrastructure.persistence.entity.StaffShiftEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffShiftRepository extends JpaRepository<StaffShiftEntity, UUID> {

    Optional<StaffShiftEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(UUID hospitalId, UUID branchId, String code);

    List<StaffShiftEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByStartTimeAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);
}
