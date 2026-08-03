package com.health360.scheduling.application.service;

import com.health360.doctor.application.service.DoctorProfileProvisioningService;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.scheduling.infrastructure.persistence.entity.DoctorScheduleEntity;
import com.health360.scheduling.infrastructure.persistence.entity.TimeSlotEntity;
import com.health360.scheduling.infrastructure.persistence.repository.DoctorScheduleRepository;
import com.health360.scheduling.infrastructure.persistence.repository.TimeSlotRepository;
import com.health360.scheduling.presentation.dto.request.BlockScheduleRequest;
import com.health360.scheduling.presentation.dto.response.SlotBlockResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SlotBlockService {

    private final DoctorScheduleRepository scheduleRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final DoctorProfileProvisioningService profileProvisioningService;
    private final AuditLogService auditLogService;

    @Transactional
    public SlotBlockResponse blockSlots(UUID userId, UUID tenantId, UUID scheduleId, BlockScheduleRequest request) {
        DoctorScheduleEntity schedule = requireSchedule(userId, tenantId, scheduleId);
        validateDateRange(request);

        long bookedCount = timeSlotRepository.countByScheduleIdAndSlotDateBetweenAndStatusAndDeletedAtIsNull(
                schedule.getId(), request.getFromDate(), request.getToDate(), "BOOKED");
        if (bookedCount > 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Cannot block slots: " + bookedCount + " booked appointment(s) exist in the selected date range");
        }

        List<TimeSlotEntity> availableSlots = timeSlotRepository
                .findByScheduleIdAndSlotDateBetweenAndStatusAndDeletedAtIsNull(
                        schedule.getId(), request.getFromDate(), request.getToDate(), "AVAILABLE");

        for (TimeSlotEntity slot : availableSlots) {
            slot.setStatus("BLOCKED");
            slot.setUpdatedBy(userId);
            slot.touch();
            timeSlotRepository.save(slot);
        }

        auditLogService.record(tenantId, userId, "SCHEDULE_SLOTS_BLOCKED", "DoctorSchedule",
                schedule.getId(), Map.of(
                        "fromDate", request.getFromDate().toString(),
                        "toDate", request.getToDate().toString(),
                        "slotsBlocked", availableSlots.size()));

        return SlotBlockResponse.builder()
                .slotsBlocked(availableSlots.size())
                .slotsUnblocked(0)
                .build();
    }

    @Transactional
    public SlotBlockResponse unblockSlots(UUID userId, UUID tenantId, UUID scheduleId, BlockScheduleRequest request) {
        DoctorScheduleEntity schedule = requireSchedule(userId, tenantId, scheduleId);
        validateDateRange(request);

        List<TimeSlotEntity> blockedSlots = timeSlotRepository
                .findByScheduleIdAndSlotDateBetweenAndStatusAndDeletedAtIsNull(
                        schedule.getId(), request.getFromDate(), request.getToDate(), "BLOCKED");

        for (TimeSlotEntity slot : blockedSlots) {
            slot.setStatus("AVAILABLE");
            slot.setUpdatedBy(userId);
            slot.touch();
            timeSlotRepository.save(slot);
        }

        auditLogService.record(tenantId, userId, "SCHEDULE_SLOTS_UNBLOCKED", "DoctorSchedule",
                schedule.getId(), Map.of(
                        "fromDate", request.getFromDate().toString(),
                        "toDate", request.getToDate().toString(),
                        "slotsUnblocked", blockedSlots.size()));

        return SlotBlockResponse.builder()
                .slotsBlocked(0)
                .slotsUnblocked(blockedSlots.size())
                .build();
    }

    private DoctorScheduleEntity requireSchedule(UUID userId, UUID tenantId, UUID scheduleId) {
        DoctorProfileEntity doctor = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        return scheduleRepository
                .findByIdAndDoctorIdAndTenantIdAndDeletedAtIsNull(scheduleId, doctor.getId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Schedule not found"));
    }

    private void validateDateRange(BlockScheduleRequest request) {
        if (request.getToDate().isBefore(request.getFromDate())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "toDate must be on or after fromDate");
        }
    }
}
