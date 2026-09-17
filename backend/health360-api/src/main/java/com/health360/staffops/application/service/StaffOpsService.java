package com.health360.staffops.application.service;

import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.StaffEntity;
import com.health360.hospital.infrastructure.persistence.repository.StaffRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.staffops.infrastructure.persistence.entity.StaffAttendanceEntity;
import com.health360.staffops.infrastructure.persistence.entity.StaffLeaveRequestEntity;
import com.health360.staffops.infrastructure.persistence.entity.StaffRosterEntryEntity;
import com.health360.staffops.infrastructure.persistence.entity.StaffShiftEntity;
import com.health360.staffops.infrastructure.persistence.repository.StaffAttendanceRepository;
import com.health360.staffops.infrastructure.persistence.repository.StaffLeaveRequestRepository;
import com.health360.staffops.infrastructure.persistence.repository.StaffRosterEntryRepository;
import com.health360.staffops.infrastructure.persistence.repository.StaffShiftRepository;
import com.health360.staffops.presentation.dto.request.CreateLeaveRequestRequest;
import com.health360.staffops.presentation.dto.request.CreateRosterEntryRequest;
import com.health360.staffops.presentation.dto.request.CreateStaffShiftRequest;
import com.health360.staffops.presentation.dto.request.DecideLeaveRequestRequest;
import com.health360.staffops.presentation.dto.request.RecordAttendanceRequest;
import com.health360.staffops.presentation.dto.response.AttendanceResponse;
import com.health360.staffops.presentation.dto.response.LeaveRequestResponse;
import com.health360.staffops.presentation.dto.response.RosterEntryResponse;
import com.health360.staffops.presentation.dto.response.StaffShiftResponse;
import com.health360.tasks.application.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffOpsService {

    private static final Set<String> ROSTER_STATUSES = Set.of("PLANNED", "CONFIRMED", "CANCELLED");
    private static final Set<String> ATTENDANCE_STATUSES = Set.of("PRESENT", "ABSENT", "LATE", "HALF_DAY");
    private static final Set<String> LEAVE_TYPES = Set.of("CASUAL", "SICK", "EARNED", "UNPAID", "OTHER");

    private final StaffShiftRepository shiftRepository;
    private final StaffRosterEntryRepository rosterRepository;
    private final StaffAttendanceRepository attendanceRepository;
    private final StaffLeaveRequestRepository leaveRepository;
    private final StaffRepository staffRepository;
    private final StaffOpsAccessService accessService;
    private final EventPublisher eventPublisher;
    private final TaskService taskService;
    private final AuditLogService auditLogService;

    @Transactional
    public StaffShiftResponse createShift(UserPrincipal principal, CreateStaffShiftRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        String code = request.getCode().trim().toUpperCase(Locale.ROOT);
        if (shiftRepository.existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), code)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT, "Shift code already exists");
        }

        StaffShiftEntity entity = new StaffShiftEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setCode(code);
        entity.setName(request.getName().trim());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setActive(true);
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        StaffShiftEntity saved = shiftRepository.save(entity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "STAFF_SHIFT_CREATED",
                "StaffShift", saved.getId(), Map.of("code", saved.getCode()));
        return toShiftResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StaffShiftResponse> listShifts(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        return shiftRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByStartTimeAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(this::toShiftResponse)
                .toList();
    }

    @Transactional
    public RosterEntryResponse createRosterEntry(UserPrincipal principal, CreateRosterEntryRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        StaffEntity staff = requireStaff(principal.getTenantId(), request.getStaffId(), request.getHospitalId());
        StaffShiftEntity shift = requireShift(principal.getTenantId(), request.getShiftId());
        if (!shift.getHospitalId().equals(request.getHospitalId())
                || !shift.getBranchId().equals(request.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Shift branch mismatch");
        }
        if (rosterRepository.existsByHospitalIdAndStaffIdAndDutyDateAndShiftIdAndDeletedAtIsNull(
                request.getHospitalId(), staff.getId(), request.getDutyDate(), shift.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT, "Roster slot already exists");
        }

        String status = normalize(request.getStatus(), "PLANNED", ROSTER_STATUSES, "Invalid roster status");

        StaffRosterEntryEntity entity = new StaffRosterEntryEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setStaffId(staff.getId());
        entity.setShiftId(shift.getId());
        entity.setDutyDate(request.getDutyDate());
        entity.setStatus(status);
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        StaffRosterEntryEntity saved = rosterRepository.save(entity);

        Map<String, Object> payload = new HashMap<>();
        payload.put("staffId", staff.getId().toString());
        payload.put("shiftCode", shift.getCode());
        payload.put("dutyDate", saved.getDutyDate().toString());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .userId(principal.getUserId())
                .eventType(HospitalEventTypes.ROSTER_ASSIGNED)
                .entityType("StaffRosterEntry")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("STAFF_OPS")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "STAFF_ROSTER_ASSIGNED",
                "StaffRosterEntry", saved.getId(), Map.of("dutyDate", saved.getDutyDate().toString()));
        return toRosterResponse(saved, shift);
    }

    @Transactional(readOnly = true)
    public Page<RosterEntryResponse> listRoster(
            UserPrincipal principal, UUID hospitalId, UUID branchId,
            LocalDate from, LocalDate to, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<StaffRosterEntryEntity> page = (from != null && to != null)
                ? rosterRepository.findByTenantIdAndHospitalIdAndBranchIdAndDutyDateBetweenAndDeletedAtIsNullOrderByDutyDateAsc(
                        principal.getTenantId(), hospitalId, branchId, from, to, pageable)
                : rosterRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByDutyDateDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(e -> toRosterResponse(e, shiftRepository.findById(e.getShiftId()).orElse(null)));
    }

    @Transactional
    public AttendanceResponse recordAttendance(UserPrincipal principal, RecordAttendanceRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        StaffEntity staff = requireStaff(principal.getTenantId(), request.getStaffId(), request.getHospitalId());
        String status = normalize(request.getStatus(), "PRESENT", ATTENDANCE_STATUSES, "Invalid attendance status");

        if (request.getRosterEntryId() != null) {
            StaffRosterEntryEntity roster = rosterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(request.getRosterEntryId(), principal.getTenantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Roster entry not found"));
            if (!roster.getStaffId().equals(staff.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Roster entry staff mismatch");
            }
        }

        StaffAttendanceEntity entity = attendanceRepository
                .findByHospitalIdAndStaffIdAndDutyDateAndDeletedAtIsNull(
                        request.getHospitalId(), staff.getId(), request.getDutyDate())
                .orElseGet(StaffAttendanceEntity::new);

        boolean isNew = entity.getId() == null;
        if (isNew) {
            entity.setTenantId(principal.getTenantId());
            entity.setHospitalId(request.getHospitalId());
            entity.setBranchId(request.getBranchId());
            entity.setStaffId(staff.getId());
            entity.setDutyDate(request.getDutyDate());
            entity.setCreatedBy(principal.getUserId());
        }
        entity.setRosterEntryId(request.getRosterEntryId());
        entity.setStatus(status);
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setUpdatedBy(principal.getUserId());

        Instant now = Instant.now();
        if (Boolean.TRUE.equals(request.getClockInNow()) || (isNew && entity.getClockIn() == null
                && !"ABSENT".equals(status))) {
            entity.setClockIn(now);
        }
        if (Boolean.TRUE.equals(request.getClockOutNow())) {
            entity.setClockOut(now);
        }

        StaffAttendanceEntity saved = attendanceRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                isNew ? "STAFF_ATTENDANCE_RECORDED" : "STAFF_ATTENDANCE_UPDATED",
                "StaffAttendance", saved.getId(), Map.of("status", saved.getStatus()));
        return toAttendanceResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> listAttendance(
            UserPrincipal principal, UUID hospitalId, UUID branchId,
            LocalDate from, LocalDate to, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<StaffAttendanceEntity> page = (from != null && to != null)
                ? attendanceRepository.findByTenantIdAndHospitalIdAndBranchIdAndDutyDateBetweenAndDeletedAtIsNullOrderByDutyDateDesc(
                        principal.getTenantId(), hospitalId, branchId, from, to, pageable)
                : attendanceRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByDutyDateDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(this::toAttendanceResponse);
    }

    @Transactional
    public LeaveRequestResponse createLeave(UserPrincipal principal, CreateLeaveRequestRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        StaffEntity staff = requireStaff(principal.getTenantId(), request.getStaffId(), request.getHospitalId());
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "endDate must be on or after startDate");
        }
        String leaveType = normalize(request.getLeaveType(), "CASUAL", LEAVE_TYPES, "Invalid leave type");

        StaffLeaveRequestEntity entity = new StaffLeaveRequestEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setStaffId(staff.getId());
        entity.setLeaveType(leaveType);
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());
        entity.setStatus("REQUESTED");
        entity.setReason(trimToNull(request.getReason()));
        entity.setRequestedAt(Instant.now());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        StaffLeaveRequestEntity saved = leaveRepository.save(entity);

        Map<String, Object> payload = new HashMap<>();
        payload.put("staffId", staff.getId().toString());
        payload.put("leaveType", saved.getLeaveType());
        payload.put("startDate", saved.getStartDate().toString());
        payload.put("endDate", saved.getEndDate().toString());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .userId(principal.getUserId())
                .eventType(HospitalEventTypes.LEAVE_REQUESTED)
                .entityType("StaffLeaveRequest")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("STAFF_OPS")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "STAFF_LEAVE_REQUESTED",
                "StaffLeaveRequest", saved.getId(), Map.of("leaveType", saved.getLeaveType()));
        return toLeaveResponse(saved);
    }

    @Transactional
    public LeaveRequestResponse decideLeave(
            UserPrincipal principal, UUID leaveRequestId, DecideLeaveRequestRequest request) {
        accessService.assertCanApprove(principal);
        StaffLeaveRequestEntity entity = leaveRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(leaveRequestId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Leave request not found"));
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"REQUESTED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only REQUESTED leave can be decided");
        }

        String decision = request.getDecision().trim().toUpperCase(Locale.ROOT);
        if (!Set.of("APPROVED", "REJECTED").contains(decision)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Decision must be APPROVED or REJECTED");
        }

        entity.setStatus(decision);
        entity.setDecisionNotes(trimToNull(request.getDecisionNotes()));
        entity.setDecidedAt(Instant.now());
        entity.setDecidedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        StaffLeaveRequestEntity saved = leaveRepository.save(entity);

        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "StaffLeaveRequest",
                saved.getId(),
                TaskTypes.REVIEW_LEAVE_REQUEST,
                principal.getUserId());

        Map<String, Object> payload = new HashMap<>();
        payload.put("decision", decision);
        payload.put("staffId", saved.getStaffId().toString());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .userId(principal.getUserId())
                .eventType(HospitalEventTypes.LEAVE_DECIDED)
                .entityType("StaffLeaveRequest")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("STAFF_OPS")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "STAFF_LEAVE_DECIDED",
                "StaffLeaveRequest", saved.getId(), Map.of("decision", decision));
        return toLeaveResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> listLeave(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<StaffLeaveRequestEntity> page = status != null && !status.isBlank()
                ? leaveRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable)
                : leaveRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(this::toLeaveResponse);
    }

    private StaffEntity requireStaff(UUID tenantId, UUID staffId, UUID hospitalId) {
        StaffEntity staff = staffRepository.findByIdAndTenantIdAndDeletedAtIsNull(staffId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Staff not found"));
        if (!staff.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Staff hospital mismatch");
        }
        if (!"ACTIVE".equalsIgnoreCase(staff.getEmploymentStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT, "Staff is not ACTIVE");
        }
        return staff;
    }

    private StaffShiftEntity requireShift(UUID tenantId, UUID shiftId) {
        return shiftRepository.findByIdAndTenantIdAndDeletedAtIsNull(shiftId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Shift not found"));
    }

    private StaffShiftResponse toShiftResponse(StaffShiftEntity e) {
        return StaffShiftResponse.builder()
                .shiftId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .code(e.getCode())
                .name(e.getName())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .active(e.isActive())
                .notes(e.getNotes())
                .build();
    }

    private RosterEntryResponse toRosterResponse(StaffRosterEntryEntity e, StaffShiftEntity shift) {
        return RosterEntryResponse.builder()
                .rosterEntryId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .staffId(e.getStaffId())
                .shiftId(e.getShiftId())
                .shiftCode(shift != null ? shift.getCode() : null)
                .shiftName(shift != null ? shift.getName() : null)
                .dutyDate(e.getDutyDate())
                .status(e.getStatus())
                .notes(e.getNotes())
                .build();
    }

    private AttendanceResponse toAttendanceResponse(StaffAttendanceEntity e) {
        return AttendanceResponse.builder()
                .attendanceId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .staffId(e.getStaffId())
                .rosterEntryId(e.getRosterEntryId())
                .dutyDate(e.getDutyDate())
                .status(e.getStatus())
                .clockIn(e.getClockIn())
                .clockOut(e.getClockOut())
                .notes(e.getNotes())
                .build();
    }

    private LeaveRequestResponse toLeaveResponse(StaffLeaveRequestEntity e) {
        return LeaveRequestResponse.builder()
                .leaveRequestId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .staffId(e.getStaffId())
                .leaveType(e.getLeaveType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .status(e.getStatus())
                .reason(e.getReason())
                .decisionNotes(e.getDecisionNotes())
                .requestedAt(e.getRequestedAt())
                .decidedAt(e.getDecidedAt())
                .build();
    }

    private static String normalize(String raw, String defaultValue, Set<String> allowed, String error) {
        if (raw == null || raw.isBlank()) {
            return defaultValue;
        }
        String value = raw.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(value)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, error);
        }
        return value;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
