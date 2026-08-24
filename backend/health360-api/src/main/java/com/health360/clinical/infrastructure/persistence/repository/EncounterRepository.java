package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
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

    @Query(
            value = """
                    SELECT * FROM clinical.encounters e
                    WHERE e.tenant_id = :tenantId
                      AND e.primary_doctor_id = :doctorId
                      AND e.deleted_at IS NULL
                      AND e.created_at >= CAST(:from AS timestamptz)
                      AND e.created_at < CAST(:to AS timestamptz)
                      AND (CAST(:status AS varchar) = '' OR e.status = CAST(:status AS varchar))
                    ORDER BY e.created_at DESC
                    """,
            countQuery = """
                    SELECT count(*) FROM clinical.encounters e
                    WHERE e.tenant_id = :tenantId
                      AND e.primary_doctor_id = :doctorId
                      AND e.deleted_at IS NULL
                      AND e.created_at >= CAST(:from AS timestamptz)
                      AND e.created_at < CAST(:to AS timestamptz)
                      AND (CAST(:status AS varchar) = '' OR e.status = CAST(:status AS varchar))
                    """,
            nativeQuery = true)
    Page<EncounterEntity> findDoctorEncountersInRange(
            @Param("tenantId") UUID tenantId,
            @Param("doctorId") UUID doctorId,
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("status") String status,
            Pageable pageable);

    Page<EncounterEntity> findByTenantIdAndPrimaryDoctorIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID primaryDoctorId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndDeletedAtIsNull(UUID tenantId, UUID hospitalId);

    boolean existsByTenantIdAndAppointmentIdAndDeletedAtIsNull(UUID tenantId, UUID appointmentId);

    Optional<EncounterEntity> findByTenantIdAndAppointmentIdAndDeletedAtIsNull(UUID tenantId, UUID appointmentId);

    long countByTenantIdAndPrimaryDoctorIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID primaryDoctorId, String status);

    long countByTenantIdAndPatientIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID patientId, String status);

    long countByTenantIdAndPatientIdAndDeletedAtIsNull(UUID tenantId, UUID patientId);
}
