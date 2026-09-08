package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdAdmissionRepository extends JpaRepository<IpdAdmissionEntity, UUID> {

    Optional<IpdAdmissionEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<IpdAdmissionEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByAdmittedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<IpdAdmissionEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByAdmittedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    boolean existsByEncounterIdAndDeletedAtIsNull(UUID encounterId);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);

    List<IpdAdmissionEntity> findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByAdmittedAtDesc(
            UUID tenantId, UUID patientId);

    Optional<IpdAdmissionEntity> findByTenantIdAndEncounterIdAndDeletedAtIsNull(UUID tenantId, UUID encounterId);

    @Query("""
            SELECT a FROM IpdAdmissionEntity a
            WHERE a.tenantId = :tenantId
              AND a.patientId = :patientId
              AND a.hospitalId = :hospitalId
              AND a.dischargedAt IS NOT NULL
              AND a.dischargedAt >= :since
              AND a.deletedAt IS NULL
              AND a.status IN :statuses
            ORDER BY a.dischargedAt DESC
            """)
    List<IpdAdmissionEntity> findRecentDischargesForPatient(
            @Param("tenantId") UUID tenantId,
            @Param("patientId") UUID patientId,
            @Param("hospitalId") UUID hospitalId,
            @Param("since") Instant since,
            @Param("statuses") Collection<String> statuses);

    @Query("""
            SELECT a FROM IpdAdmissionEntity a
            WHERE a.tenantId = :tenantId
              AND a.hospitalId = :hospitalId
              AND a.readmittedFromAdmissionId IS NOT NULL
              AND a.admittedAt >= :from
              AND a.admittedAt < :to
              AND a.deletedAt IS NULL
            ORDER BY a.admittedAt DESC
            """)
    List<IpdAdmissionEntity> findReadmissionsInRange(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
            SELECT a FROM IpdAdmissionEntity a
            WHERE a.tenantId = :tenantId
              AND a.hospitalId = :hospitalId
              AND a.branchId = :branchId
              AND a.dischargedAt IS NOT NULL
              AND a.admittedAt IS NOT NULL
              AND a.dischargedAt >= :from
              AND a.dischargedAt < :to
              AND a.deletedAt IS NULL
            """)
    List<IpdAdmissionEntity> findDischargesInRange(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, Collection<String> statuses);
}
