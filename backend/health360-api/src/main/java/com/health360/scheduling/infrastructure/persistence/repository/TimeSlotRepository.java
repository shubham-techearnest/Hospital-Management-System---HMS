package com.health360.scheduling.infrastructure.persistence.repository;

import com.health360.scheduling.infrastructure.persistence.entity.TimeSlotEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimeSlotRepository extends JpaRepository<TimeSlotEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TimeSlotEntity s WHERE s.id = :id AND s.deletedAt IS NULL")
    Optional<TimeSlotEntity> findByIdForUpdate(@Param("id") UUID id);

    List<TimeSlotEntity> findByDoctorIdAndHospitalIdAndBranchIdAndSlotDateBetweenAndDeletedAtIsNullOrderBySlotDateAscStartTimeAsc(
            UUID doctorId, UUID hospitalId, UUID branchId, LocalDate from, LocalDate to);

    List<TimeSlotEntity> findByScheduleIdAndSlotDateGreaterThanEqualAndStatusAndDeletedAtIsNull(
            UUID scheduleId, LocalDate fromDate, String status);

    Optional<TimeSlotEntity> findByDoctorIdAndHospitalIdAndBranchIdAndSlotDateAndStartTimeAndConsultationTypeAndDeletedAtIsNull(
            UUID doctorId, UUID hospitalId, UUID branchId, LocalDate slotDate,
            java.time.LocalTime startTime, String consultationType);

    long countByDoctorIdAndSlotDateAndStatusAndDeletedAtIsNull(
            UUID doctorId, LocalDate slotDate, String status);

    long countByDoctorIdAndSlotDateBetweenAndStatusAndDeletedAtIsNull(
            UUID doctorId, LocalDate fromDate, LocalDate toDate, String status);

    List<TimeSlotEntity> findByScheduleIdAndSlotDateBetweenAndStatusAndDeletedAtIsNull(
            UUID scheduleId, LocalDate fromDate, LocalDate toDate, String status);

    long countByScheduleIdAndSlotDateBetweenAndStatusAndDeletedAtIsNull(
            UUID scheduleId, LocalDate fromDate, LocalDate toDate, String status);
}
