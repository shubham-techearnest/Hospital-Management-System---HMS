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

    @Query("""
            SELECT e FROM EncounterEntity e
            WHERE e.tenantId = :tenantId
              AND e.primaryDoctorId = :doctorId
              AND e.deletedAt IS NULL
              AND (:encounterType IS NULL OR e.encounterType = :encounterType)
              AND (:from IS NULL OR e.createdAt >= :from)
              AND (:to IS NULL OR e.createdAt < :to)
              AND (:status IS NULL OR e.status = :status)
            ORDER BY e.createdAt DESC
            """)
    Page<EncounterEntity> findDoctorEncountersFiltered(
            @Param("tenantId") UUID tenantId,
            @Param("doctorId") UUID doctorId,
            @Param("encounterType") String encounterType,
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("status") String status,
            Pageable pageable);

    long countByTenantIdAndHospitalIdAndDeletedAtIsNull(UUID tenantId, UUID hospitalId);

    boolean existsByTenantIdAndAppointmentIdAndDeletedAtIsNull(UUID tenantId, UUID appointmentId);

    long countByTenantIdAndPrimaryDoctorIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID primaryDoctorId, String status);

    long countByTenantIdAndPatientIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID patientId, String status);

    long countByTenantIdAndPatientIdAndDeletedAtIsNull(UUID tenantId, UUID patientId);
}
