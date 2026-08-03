package com.health360.scheduling.infrastructure.persistence.repository;

import com.health360.scheduling.infrastructure.persistence.entity.DoctorScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorScheduleRepository extends JpaRepository<DoctorScheduleEntity, UUID> {

    List<DoctorScheduleEntity> findByDoctorIdAndTenantIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID doctorId, UUID tenantId);

    Optional<DoctorScheduleEntity> findByIdAndDoctorIdAndTenantIdAndDeletedAtIsNull(
            UUID id, UUID doctorId, UUID tenantId);

    Optional<DoctorScheduleEntity> findByDoctorIdAndHospitalIdAndBranchIdAndActiveTrueAndDeletedAtIsNull(
            UUID doctorId, UUID hospitalId, UUID branchId);
}
