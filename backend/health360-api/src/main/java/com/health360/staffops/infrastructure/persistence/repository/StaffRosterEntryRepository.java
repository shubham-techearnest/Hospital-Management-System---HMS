package com.health360.staffops.infrastructure.persistence.repository;

import com.health360.staffops.infrastructure.persistence.entity.StaffRosterEntryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface StaffRosterEntryRepository extends JpaRepository<StaffRosterEntryEntity, UUID> {

    Optional<StaffRosterEntryEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndStaffIdAndDutyDateAndShiftIdAndDeletedAtIsNull(
            UUID hospitalId, UUID staffId, LocalDate dutyDate, UUID shiftId);

    Page<StaffRosterEntryEntity> findByTenantIdAndHospitalIdAndBranchIdAndDutyDateBetweenAndDeletedAtIsNullOrderByDutyDateAsc(
            UUID tenantId, UUID hospitalId, UUID branchId, LocalDate from, LocalDate to, Pageable pageable);

    Page<StaffRosterEntryEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByDutyDateDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);
}
