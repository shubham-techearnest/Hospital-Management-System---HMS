package com.health360.staffops.infrastructure.persistence.repository;

import com.health360.staffops.infrastructure.persistence.entity.StaffAttendanceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface StaffAttendanceRepository extends JpaRepository<StaffAttendanceEntity, UUID> {

    Optional<StaffAttendanceEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<StaffAttendanceEntity> findByHospitalIdAndStaffIdAndDutyDateAndDeletedAtIsNull(
            UUID hospitalId, UUID staffId, LocalDate dutyDate);

    Page<StaffAttendanceEntity> findByTenantIdAndHospitalIdAndBranchIdAndDutyDateBetweenAndDeletedAtIsNullOrderByDutyDateDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, LocalDate from, LocalDate to, Pageable pageable);

    Page<StaffAttendanceEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByDutyDateDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);
}
