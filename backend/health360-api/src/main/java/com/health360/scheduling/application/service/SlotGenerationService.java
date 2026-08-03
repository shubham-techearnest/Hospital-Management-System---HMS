package com.health360.scheduling.application.service;

import com.health360.scheduling.infrastructure.persistence.entity.DoctorScheduleEntity;
import com.health360.scheduling.infrastructure.persistence.entity.ScheduleBlockEntity;
import com.health360.scheduling.infrastructure.persistence.entity.TimeSlotEntity;
import com.health360.scheduling.infrastructure.persistence.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SlotGenerationService {

    private final TimeSlotRepository timeSlotRepository;

    @Transactional
    public void generateSlotsForSchedule(DoctorScheduleEntity schedule, List<ScheduleBlockEntity> blocks) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(schedule.getHorizonDays());

        for (LocalDate date = today; !date.isAfter(end); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            for (ScheduleBlockEntity block : blocks) {
                if (!block.isActive() || !block.getDayOfWeek().equals(dayOfWeek.name())) {
                    continue;
                }
                generateSlotsForBlock(schedule, block, date);
            }
        }
    }

    @Transactional
    public void regenerateFutureAvailableSlots(DoctorScheduleEntity schedule, List<ScheduleBlockEntity> blocks) {
        LocalDate today = LocalDate.now();
        List<TimeSlotEntity> existing = timeSlotRepository
                .findByScheduleIdAndSlotDateGreaterThanEqualAndStatusAndDeletedAtIsNull(
                        schedule.getId(), today, "AVAILABLE");
        for (TimeSlotEntity slot : existing) {
            slot.setDeletedAt(java.time.Instant.now());
            timeSlotRepository.save(slot);
        }
        generateSlotsForSchedule(schedule, blocks);
    }

    private void generateSlotsForBlock(DoctorScheduleEntity schedule, ScheduleBlockEntity block, LocalDate date) {
        LocalTime cursor = block.getStartTime();
        int duration = schedule.getSlotDurationMinutes();
        int buffer = schedule.getBufferMinutes();

        while (true) {
            LocalTime slotEnd = cursor.plusMinutes(duration);
            if (slotEnd.isAfter(block.getEndTime())) {
                break;
            }

            upsertAvailableSlot(schedule, block, date, cursor, slotEnd);
            cursor = slotEnd.plusMinutes(buffer);
            if (!cursor.isBefore(block.getEndTime()) && !cursor.equals(block.getEndTime())) {
                if (cursor.isAfter(block.getEndTime())) {
                    break;
                }
            }
        }
    }

    private void upsertAvailableSlot(
            DoctorScheduleEntity schedule,
            ScheduleBlockEntity block,
            LocalDate date,
            LocalTime start,
            LocalTime end) {
        var existing = timeSlotRepository.findByDoctorIdAndHospitalIdAndBranchIdAndSlotDateAndStartTimeAndConsultationTypeAndDeletedAtIsNull(
                schedule.getDoctorId(),
                schedule.getHospitalId(),
                schedule.getBranchId(),
                date,
                start,
                block.getConsultationType());

        if (existing.isPresent()) {
            TimeSlotEntity slot = existing.get();
            if ("BOOKED".equals(slot.getStatus()) || "BLOCKED".equals(slot.getStatus())) {
                return;
            }
            slot.setEndTime(end);
            slot.setScheduleId(schedule.getId());
            slot.setStatus("AVAILABLE");
            timeSlotRepository.save(slot);
            return;
        }

        TimeSlotEntity slot = new TimeSlotEntity();
        slot.setTenantId(schedule.getTenantId());
        slot.setScheduleId(schedule.getId());
        slot.setDoctorId(schedule.getDoctorId());
        slot.setHospitalId(schedule.getHospitalId());
        slot.setBranchId(schedule.getBranchId());
        slot.setSlotDate(date);
        slot.setStartTime(start);
        slot.setEndTime(end);
        slot.setConsultationType(block.getConsultationType());
        slot.setStatus("AVAILABLE");
        slot.setCreatedBy(schedule.getUpdatedBy());
        slot.setUpdatedBy(schedule.getUpdatedBy());
        timeSlotRepository.save(slot);
    }
}
