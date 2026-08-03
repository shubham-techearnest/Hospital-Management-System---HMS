package com.health360.scheduling.application.service;

import com.health360.doctor.application.service.DoctorProfileProvisioningService;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.scheduling.infrastructure.persistence.entity.DoctorScheduleEntity;
import com.health360.scheduling.infrastructure.persistence.entity.ScheduleBlockEntity;
import com.health360.scheduling.infrastructure.persistence.repository.DoctorScheduleRepository;
import com.health360.scheduling.infrastructure.persistence.repository.ScheduleBlockRepository;
import com.health360.scheduling.presentation.dto.request.CreateScheduleRequest;
import com.health360.scheduling.presentation.dto.response.ScheduleResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final ScheduleBlockRepository blockRepository;
    private final DoctorProfileProvisioningService profileProvisioningService;
    private final HospitalAssociationRepository associationRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final SlotGenerationService slotGenerationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<ScheduleResponse> listSchedules(UUID userId, UUID tenantId) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        return scheduleRepository.findByDoctorIdAndTenantIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        doctor.getId(), tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ScheduleResponse createSchedule(UUID userId, UUID tenantId, CreateScheduleRequest request) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        validateAssociation(doctor.getId(), request.getHospitalId(), request.getBranchId());
        validateHospitalBranch(request.getHospitalId(), request.getBranchId());
        validateBlocks(request.getScheduleBlocks());

        scheduleRepository.findByDoctorIdAndHospitalIdAndBranchIdAndActiveTrueAndDeletedAtIsNull(
                        doctor.getId(), request.getHospitalId(), request.getBranchId())
                .ifPresent(existing -> {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                            "An active schedule already exists for this hospital and branch");
                });

        DoctorScheduleEntity schedule = new DoctorScheduleEntity();
        schedule.setTenantId(tenantId);
        schedule.setDoctorId(doctor.getId());
        schedule.setHospitalId(request.getHospitalId());
        schedule.setBranchId(request.getBranchId());
        schedule.setSlotDurationMinutes(request.getSlotDurationMinutes());
        schedule.setBufferMinutes(request.getBufferMinutes());
        schedule.setHorizonDays(request.getHorizonDays());
        schedule.setActive(true);
        schedule.setCreatedBy(userId);
        schedule.setUpdatedBy(userId);
        schedule = scheduleRepository.saveAndFlush(schedule);

        List<ScheduleBlockEntity> blocks = saveBlocks(schedule, request.getScheduleBlocks(), userId);
        slotGenerationService.generateSlotsForSchedule(schedule, blocks);

        auditLogService.record(tenantId, userId, "SCHEDULE_CREATED", "DoctorSchedule",
                schedule.getId(), Map.of("hospitalId", request.getHospitalId().toString()));

        return toResponse(schedule);
    }

    @Transactional
    public ScheduleResponse updateSchedule(
            UUID userId, UUID tenantId, UUID scheduleId, CreateScheduleRequest request) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        DoctorScheduleEntity schedule = scheduleRepository
                .findByIdAndDoctorIdAndTenantIdAndDeletedAtIsNull(scheduleId, doctor.getId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Schedule not found"));
        validateBlocks(request.getScheduleBlocks());

        schedule.setSlotDurationMinutes(request.getSlotDurationMinutes());
        schedule.setBufferMinutes(request.getBufferMinutes());
        schedule.setHorizonDays(request.getHorizonDays());
        schedule.setUpdatedBy(userId);
        schedule.touch();
        schedule = scheduleRepository.save(schedule);

        blockRepository.findByScheduleIdAndDeletedAtIsNullOrderByDayOfWeekAscStartTimeAsc(schedule.getId())
                .forEach(block -> {
                    block.setDeletedAt(java.time.Instant.now());
                    blockRepository.save(block);
                });
        List<ScheduleBlockEntity> blocks = saveBlocks(schedule, request.getScheduleBlocks(), userId);
        slotGenerationService.regenerateFutureAvailableSlots(schedule, blocks);

        auditLogService.record(tenantId, userId, "SCHEDULE_UPDATED", "DoctorSchedule", schedule.getId(), Map.of());

        return toResponse(schedule);
    }

    private List<ScheduleBlockEntity> saveBlocks(
            DoctorScheduleEntity schedule,
            List<CreateScheduleRequest.ScheduleBlockRequest> blockRequests,
            UUID userId) {
        List<ScheduleBlockEntity> blocks = new ArrayList<>();
        for (CreateScheduleRequest.ScheduleBlockRequest req : blockRequests) {
            ScheduleBlockEntity block = new ScheduleBlockEntity();
            block.setTenantId(schedule.getTenantId());
            block.setScheduleId(schedule.getId());
            block.setDayOfWeek(req.getDayOfWeek());
            block.setStartTime(req.getStartTime());
            block.setEndTime(req.getEndTime());
            block.setConsultationType(req.getConsultationType());
            block.setActive(req.isActive());
            block.setCreatedBy(userId);
            block.setUpdatedBy(userId);
            blocks.add(blockRepository.save(block));
        }
        return blocks;
    }

    private void validateBlocks(List<CreateScheduleRequest.ScheduleBlockRequest> blocks) {
        Map<String, List<CreateScheduleRequest.ScheduleBlockRequest>> byDay = blocks.stream()
                .filter(CreateScheduleRequest.ScheduleBlockRequest::isActive)
                .collect(Collectors.groupingBy(CreateScheduleRequest.ScheduleBlockRequest::getDayOfWeek));

        for (var entry : byDay.entrySet()) {
            List<CreateScheduleRequest.ScheduleBlockRequest> dayBlocks = new ArrayList<>(entry.getValue());
            dayBlocks.sort(Comparator.comparing(CreateScheduleRequest.ScheduleBlockRequest::getStartTime));
            for (int i = 0; i < dayBlocks.size(); i++) {
                CreateScheduleRequest.ScheduleBlockRequest block = dayBlocks.get(i);
                if (!block.getEndTime().isAfter(block.getStartTime())) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                            "End time must be after start time for " + block.getDayOfWeek());
                }
                if (i > 0) {
                    CreateScheduleRequest.ScheduleBlockRequest prev = dayBlocks.get(i - 1);
                    if (block.getStartTime().isBefore(prev.getEndTime())) {
                        throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                                "Overlapping schedule blocks on " + block.getDayOfWeek());
                    }
                }
            }
        }
    }

    private void validateAssociation(UUID doctorId, UUID hospitalId, UUID branchId) {
        if (!associationRepository.existsByDoctorIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                doctorId, hospitalId, branchId, "ACTIVE")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Doctor must have an active hospital association for the selected branch");
        }
    }

    private void validateHospitalBranch(UUID hospitalId, UUID branchId) {
        hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Hospital not found"));
        branchRepository.findById(branchId)
                .filter(b -> hospitalId.equals(b.getHospitalId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Branch not found for hospital"));
    }

    private DoctorProfileEntity requireDoctor(UUID userId, UUID tenantId) {
        return profileProvisioningService.ensureProfileEntity(userId, tenantId);
    }

    private ScheduleResponse toResponse(DoctorScheduleEntity schedule) {
        List<ScheduleBlockEntity> blocks = blockRepository
                .findByScheduleIdAndDeletedAtIsNullOrderByDayOfWeekAscStartTimeAsc(schedule.getId());
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .hospitalId(schedule.getHospitalId())
                .branchId(schedule.getBranchId())
                .slotDurationMinutes(schedule.getSlotDurationMinutes())
                .bufferMinutes(schedule.getBufferMinutes())
                .horizonDays(schedule.getHorizonDays())
                .active(schedule.isActive())
                .scheduleBlocks(blocks.stream().map(b -> ScheduleResponse.ScheduleBlockResponse.builder()
                        .id(b.getId())
                        .dayOfWeek(b.getDayOfWeek())
                        .startTime(b.getStartTime())
                        .endTime(b.getEndTime())
                        .consultationType(b.getConsultationType())
                        .active(b.isActive())
                        .build()).toList())
                .build();
    }
}
