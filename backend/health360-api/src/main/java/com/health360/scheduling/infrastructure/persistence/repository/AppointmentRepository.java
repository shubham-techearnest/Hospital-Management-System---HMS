package com.health360.scheduling.infrastructure.persistence.repository;

import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, UUID> {

    Optional<AppointmentEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AppointmentEntity a WHERE a.id = :id AND a.deletedAt IS NULL")
    Optional<AppointmentEntity> findByIdForUpdate(@Param("id") UUID id);

    List<AppointmentEntity> findByPatientIdAndTenantIdAndDeletedAtIsNullOrderByScheduledAtDesc(
            UUID patientId, UUID tenantId);

    List<AppointmentEntity> findByDoctorIdAndTenantIdAndDeletedAtIsNullOrderByScheduledAtDesc(
            UUID doctorId, UUID tenantId);

    List<AppointmentEntity> findByStatusInAndScheduledAtBetweenAndDeletedAtIsNull(
            List<String> statuses, Instant from, Instant to);

    @Query("""
            SELECT COUNT(a) > 0 FROM AppointmentEntity a
            WHERE a.patientId = :patientId
              AND a.doctorId = :doctorId
              AND a.status IN ('PENDING', 'CONFIRMED')
              AND a.scheduledAt >= :from
              AND a.scheduledAt < :to
              AND a.deletedAt IS NULL
            """)
    boolean existsActiveAppointmentForPatientDoctorOnDate(
            @Param("patientId") UUID patientId,
            @Param("doctorId") UUID doctorId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
            SELECT COUNT(a) FROM AppointmentEntity a
            WHERE a.hospitalId = :hospitalId
              AND a.status NOT IN ('CANCELLED', 'RESCHEDULED')
              AND a.createdAt >= :from
              AND a.createdAt < :to
              AND a.deletedAt IS NULL
            """)
    long countByHospitalIdAndCreatedAtBetweenExcludingCancelled(
            @Param("hospitalId") UUID hospitalId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
            SELECT COUNT(a) FROM AppointmentEntity a
            WHERE a.doctorId = :doctorId
              AND a.tenantId = :tenantId
              AND a.deletedAt IS NULL
              AND a.status IN ('PENDING', 'CONFIRMED')
              AND a.scheduledAt >= :from
            """)
    long countUpcomingByDoctor(
            @Param("doctorId") UUID doctorId,
            @Param("tenantId") UUID tenantId,
            @Param("from") Instant from);
}
