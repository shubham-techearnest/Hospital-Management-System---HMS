package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EncounterRepository extends JpaRepository<EncounterEntity, UUID> {

    Optional<EncounterEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<EncounterEntity> findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID patientId, Pageable pageable);

    Page<EncounterEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, Pageable pageable);

    Page<EncounterEntity> findByTenantIdAndPrimaryDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID primaryDoctorId, Pageable pageable);

    long countByTenantIdAndHospitalIdAndDeletedAtIsNull(UUID tenantId, UUID hospitalId);

    boolean existsByTenantIdAndAppointmentIdAndDeletedAtIsNull(UUID tenantId, UUID appointmentId);
}
