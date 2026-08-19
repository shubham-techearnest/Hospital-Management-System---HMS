package com.health360.ot.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.domain.ClinicalOrderStatus;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.ot.domain.*;
import com.health360.ot.infrastructure.persistence.entity.*;
import com.health360.ot.infrastructure.persistence.repository.*;
import com.health360.ot.presentation.dto.request.*;
import com.health360.ot.presentation.dto.response.*;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtProcedureService {

    private final OtProcedureRepository procedureRepository;
    private final OtScheduleRepository scheduleRepository;
    private final OtTeamMemberRepository teamMemberRepository;
    private final OtNoteRepository noteRepository;
    private final OperationTheatreRepository theatreRepository;
    private final ClinicalOrderRepository clinicalOrderRepository;
    private final ClinicalOrderItemRepository clinicalOrderItemRepository;
    private final EncounterRepository encounterRepository;
    private final OtFacilityService facilityService;
    private final OtAccessService accessService;
    private final EncounterAccessService encounterAccessService;
    private final OtMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<OtWorklistItemResponse> listPendingWorklist(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadProcedures(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        return procedureRepository.findPendingProcedureItems(tenantId, hospitalId, branchId).stream()
                .map(item -> {
                    ClinicalOrderEntity order = clinicalOrderRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                            .orElseThrow();
                    EncounterEntity encounter = encounterRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(order.getEncounterId(), tenantId)
                            .orElseThrow();
                    return OtWorklistItemResponse.builder()
                            .clinicalOrderItemId(item.getId())
                            .clinicalOrderId(order.getId())
                            .encounterId(encounter.getId())
                            .patientId(encounter.getPatientId())
                            .orderNumber(order.getOrderNumber())
                            .itemName(item.getItemName())
                            .itemCode(item.getItemCode())
                            .orderedAt(order.getOrderedAt())
                            .build();
                })
                .toList();
    }

    @Transactional
    public OtProcedureResponse createProcedure(UserPrincipal principal, CreateOtProcedureRequest request) {
        accessService.assertCanManageProcedures(principal);
        UUID tenantId = principal.getTenantId();

        ClinicalOrderItemEntity item = clinicalOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getClinicalOrderItemId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical order item not found"));

        if (!ClinicalOrderStatus.ORDERED.name().equals(item.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order item is not in ORDERED status");
        }

        if (procedureRepository.findByClinicalOrderItemIdAndDeletedAtIsNull(item.getId()).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "OT procedure already exists for this clinical order item");
        }

        ClinicalOrderEntity clinicalOrder = clinicalOrderRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                .orElseThrow();

        if (!"PROCEDURE".equals(clinicalOrder.getOrderType())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order is not a PROCEDURE order");
        }

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrder.getEncounterId(), tenantId)
                .orElseThrow();

        accessService.assertHospitalScope(principal, encounter.getHospitalId());

        OtProcedureEntity procedure = new OtProcedureEntity();
        procedure.setTenantId(tenantId);
        procedure.setClinicalOrderItemId(item.getId());
        procedure.setClinicalOrderId(clinicalOrder.getId());
        procedure.setEncounterId(encounter.getId());
        procedure.setPatientId(encounter.getPatientId());
        procedure.setHospitalId(encounter.getHospitalId());
        procedure.setBranchId(encounter.getBranchId());
        procedure.setProcedureName(item.getItemName());
        procedure.setStatus(OtProcedureStatus.RECEIVED.name());
        procedure.setReceivedAt(Instant.now());
        procedure.setCreatedBy(principal.getUserId());
        procedure.setUpdatedBy(principal.getUserId());

        OtProcedureEntity saved = procedureRepository.save(procedure);

        item.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
        item.setUpdatedBy(principal.getUserId());
        clinicalOrderItemRepository.save(item);

        clinicalOrder.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
        clinicalOrder.setUpdatedBy(principal.getUserId());
        clinicalOrderRepository.save(clinicalOrder);

        auditLogService.record(tenantId, principal.getUserId(), "OT_PROCEDURE_CREATED",
                "OtProcedure", saved.getId(), Map.of("clinicalOrderItemId", item.getId().toString()));

        return buildProcedureResponse(tenantId, saved);
    }

    @Transactional(readOnly = true)
    public Page<OtProcedureResponse> listProcedures(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanReadProcedures(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        Page<OtProcedureEntity> page;
        if (status != null && !status.isBlank()) {
            page = procedureRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
                            tenantId, hospitalId, branchId, status.trim().toUpperCase(), pageable);
        } else {
            page = procedureRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
                            tenantId, hospitalId, branchId, pageable);
        }
        return page.map(p -> buildProcedureResponse(tenantId, p));
    }

    @Transactional(readOnly = true)
    public OtProcedureResponse getProcedure(UserPrincipal principal, UUID procedureId) {
        accessService.assertCanReadProcedures(principal);
        OtProcedureEntity procedure = requireProcedure(principal.getTenantId(), procedureId);
        accessService.assertHospitalScope(principal, procedure.getHospitalId());
        return buildProcedureResponse(principal.getTenantId(), procedure);
    }

    @Transactional
    public OtProcedureResponse scheduleProcedure(
            UserPrincipal principal, UUID procedureId, ScheduleOtProcedureRequest request) {
        accessService.assertCanManageSchedules(principal);
        UUID tenantId = principal.getTenantId();
        OtProcedureEntity procedure = requireProcedure(tenantId, procedureId);
        accessService.assertHospitalScope(principal, procedure.getHospitalId());
        assertStatus(procedure, OtProcedureStatus.RECEIVED);

        if (!request.getScheduledEnd().isAfter(request.getScheduledStart())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Scheduled end must be after scheduled start");
        }

        OperationTheatreEntity theatre = facilityService.requireTheatre(tenantId, request.getTheatreId());
        if (!theatre.getHospitalId().equals(procedure.getHospitalId())
                || !theatre.getBranchId().equals(procedure.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Theatre does not belong to this hospital branch");
        }

        if (OtTheatreStatus.MAINTENANCE.name().equals(theatre.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Theatre is under maintenance");
        }

        long conflicts = scheduleRepository.countConflictingSchedules(
                theatre.getId(), request.getScheduledStart(), request.getScheduledEnd(), null);
        if (conflicts > 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Theatre is already scheduled for this time slot");
        }

        OtScheduleEntity schedule = new OtScheduleEntity();
        schedule.setTenantId(tenantId);
        schedule.setTheatreId(theatre.getId());
        schedule.setScheduledStart(request.getScheduledStart());
        schedule.setScheduledEnd(request.getScheduledEnd());
        schedule.setStatus(OtScheduleStatus.SCHEDULED.name());
        schedule.setCreatedBy(principal.getUserId());
        schedule.setUpdatedBy(principal.getUserId());
        OtScheduleEntity savedSchedule = scheduleRepository.save(schedule);

        procedure.setTheatreId(theatre.getId());
        procedure.setScheduleId(savedSchedule.getId());
        procedure.setStatus(OtProcedureStatus.SCHEDULED.name());
        procedure.setUpdatedBy(principal.getUserId());
        procedureRepository.save(procedure);

        if (OtTheatreStatus.AVAILABLE.name().equals(theatre.getStatus())) {
            theatre.setStatus(OtTheatreStatus.SCHEDULED.name());
            theatre.setUpdatedBy(principal.getUserId());
            theatreRepository.save(theatre);
        }

        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            addNoteInternal(tenantId, principal.getUserId(), procedure.getId(), OtNoteType.PRE_OP.name(),
                    request.getNotes().trim());
        }

        return buildProcedureResponse(tenantId, procedure);
    }

    @Transactional
    public OtTeamMemberResponse addTeamMember(
            UserPrincipal principal, UUID procedureId, AddOtTeamMemberRequest request) {
        accessService.assertCanManageProcedures(principal);
        UUID tenantId = principal.getTenantId();
        OtProcedureEntity procedure = requireProcedure(tenantId, procedureId);
        accessService.assertHospitalScope(principal, procedure.getHospitalId());

        if (OtProcedureStatus.COMPLETED.name().equals(procedure.getStatus())
                || OtProcedureStatus.CANCELLED.name().equals(procedure.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Cannot add team members to a closed procedure");
        }

        OtTeamRole role = parseTeamRole(request.getMemberRole());

        OtTeamMemberEntity member = new OtTeamMemberEntity();
        member.setTenantId(tenantId);
        member.setProcedureId(procedureId);
        member.setMemberRole(role.name());
        member.setUserId(request.getUserId());
        member.setMemberName(trimToNull(request.getMemberName()));
        member.setCreatedBy(principal.getUserId());
        member.setUpdatedBy(principal.getUserId());

        return mapper.toTeamMemberResponse(teamMemberRepository.save(member));
    }

    @Transactional
    public OtNoteResponse addNote(UserPrincipal principal, UUID procedureId, AddOtNoteRequest request) {
        accessService.assertCanManageProcedures(principal);
        UUID tenantId = principal.getTenantId();
        OtProcedureEntity procedure = requireProcedure(tenantId, procedureId);
        accessService.assertHospitalScope(principal, procedure.getHospitalId());

        if (OtProcedureStatus.COMPLETED.name().equals(procedure.getStatus())
                || OtProcedureStatus.CANCELLED.name().equals(procedure.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Cannot add notes to a closed procedure");
        }

        OtNoteType noteType = parseNoteType(request.getNoteType());
        return mapper.toNoteResponse(
                addNoteInternal(tenantId, principal.getUserId(), procedureId, noteType.name(), request.getContent()));
    }

    @Transactional
    public OtProcedureResponse startProcedure(UserPrincipal principal, UUID procedureId) {
        accessService.assertCanManageProcedures(principal);
        UUID tenantId = principal.getTenantId();
        OtProcedureEntity procedure = requireProcedure(tenantId, procedureId);
        accessService.assertHospitalScope(principal, procedure.getHospitalId());
        assertStatus(procedure, OtProcedureStatus.SCHEDULED);

        if (teamMemberRepository.countByProcedureIdAndDeletedAtIsNull(procedureId) == 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "At least one team member must be recorded before starting the procedure");
        }

        if (!noteRepository.existsByProcedureIdAndNoteTypeAndDeletedAtIsNull(
                procedureId, OtNoteType.PRE_OP.name())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Pre-op note is required before starting the procedure");
        }

        Instant now = Instant.now();
        procedure.setStatus(OtProcedureStatus.IN_PROGRESS.name());
        procedure.setStartedAt(now);
        procedure.setUpdatedBy(principal.getUserId());
        procedureRepository.save(procedure);

        OtScheduleEntity schedule = requireSchedule(tenantId, procedure.getScheduleId());
        schedule.setStatus(OtScheduleStatus.IN_USE.name());
        schedule.setUpdatedBy(principal.getUserId());
        scheduleRepository.save(schedule);

        OperationTheatreEntity theatre = facilityService.requireTheatre(tenantId, procedure.getTheatreId());
        theatre.setStatus(OtTheatreStatus.IN_USE.name());
        theatre.setUpdatedBy(principal.getUserId());
        theatreRepository.save(theatre);

        return buildProcedureResponse(tenantId, procedure);
    }

    @Transactional
    public OtProcedureResponse completeProcedure(
            UserPrincipal principal, UUID procedureId, CompleteOtProcedureRequest request) {
        accessService.assertCanManageProcedures(principal);
        UUID tenantId = principal.getTenantId();
        OtProcedureEntity procedure = requireProcedure(tenantId, procedureId);
        accessService.assertHospitalScope(principal, procedure.getHospitalId());
        assertStatus(procedure, OtProcedureStatus.IN_PROGRESS);

        if (!noteRepository.existsByProcedureIdAndNoteTypeAndDeletedAtIsNull(
                procedureId, OtNoteType.INTRA_OP.name())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Intra-op note is required before completing the procedure");
        }

        if (!noteRepository.existsByProcedureIdAndNoteTypeAndDeletedAtIsNull(
                procedureId, OtNoteType.POST_OP.name())) {
            if (request.getSummaryText() == null || request.getSummaryText().isBlank()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Post-op note or completion summary is required");
            }
            addNoteInternal(tenantId, principal.getUserId(), procedureId, OtNoteType.POST_OP.name(),
                    request.getSummaryText().trim());
        }

        Instant now = Instant.now();
        procedure.setStatus(OtProcedureStatus.COMPLETED.name());
        procedure.setCompletedAt(now);
        procedure.setUpdatedBy(principal.getUserId());
        procedureRepository.save(procedure);

        OtScheduleEntity schedule = requireSchedule(tenantId, procedure.getScheduleId());
        schedule.setStatus(OtScheduleStatus.COMPLETED.name());
        schedule.setUpdatedBy(principal.getUserId());
        scheduleRepository.save(schedule);

        OperationTheatreEntity theatre = facilityService.requireTheatre(tenantId, procedure.getTheatreId());
        theatre.setStatus(OtTheatreStatus.AVAILABLE.name());
        theatre.setUpdatedBy(principal.getUserId());
        theatreRepository.save(theatre);

        ClinicalOrderItemEntity item = clinicalOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(procedure.getClinicalOrderItemId(), tenantId)
                .orElseThrow();
        item.setStatus(ClinicalOrderStatus.COMPLETED.name());
        item.setUpdatedBy(principal.getUserId());
        clinicalOrderItemRepository.save(item);

        updateClinicalOrderCompletion(tenantId, procedure.getClinicalOrderId(), principal.getUserId());

        auditLogService.record(tenantId, principal.getUserId(), "OT_PROCEDURE_COMPLETED",
                "OtProcedure", procedureId, Map.of());

        return buildProcedureResponse(tenantId, procedure);
    }

    @Transactional(readOnly = true)
    public List<OtProcedureResponse> listCompletedProceduresForEncounter(
            UserPrincipal principal, UUID encounterId) {
        UUID tenantId = principal.getTenantId();
        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
        encounterAccessService.assertCanReadEncounter(principal, encounter);

        return procedureRepository
                .findByTenantIdAndEncounterIdAndStatusAndDeletedAtIsNullOrderByCompletedAtDesc(
                        tenantId, encounterId, OtProcedureStatus.COMPLETED.name())
                .stream()
                .map(p -> buildProcedureResponse(tenantId, p))
                .toList();
    }

    private OtNoteEntity addNoteInternal(
            UUID tenantId, UUID userId, UUID procedureId, String noteType, String content) {
        OtNoteEntity note = new OtNoteEntity();
        note.setTenantId(tenantId);
        note.setProcedureId(procedureId);
        note.setNoteType(noteType);
        note.setContent(content.trim());
        note.setRecordedAt(Instant.now());
        note.setRecordedBy(userId);
        note.setCreatedBy(userId);
        note.setUpdatedBy(userId);
        return noteRepository.save(note);
    }

    private void updateClinicalOrderCompletion(UUID tenantId, UUID clinicalOrderId, UUID userId) {
        ClinicalOrderEntity order = clinicalOrderRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrderId, tenantId)
                .orElseThrow();
        List<ClinicalOrderItemEntity> items = clinicalOrderItemRepository
                .findByOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(clinicalOrderId);
        boolean allComplete = items.stream()
                .allMatch(i -> ClinicalOrderStatus.COMPLETED.name().equals(i.getStatus()));
        if (allComplete) {
            order.setStatus(ClinicalOrderStatus.COMPLETED.name());
            order.setUpdatedBy(userId);
            clinicalOrderRepository.save(order);
        }
    }

    private OtProcedureResponse buildProcedureResponse(UUID tenantId, OtProcedureEntity procedure) {
        OperationTheatreEntity theatre = procedure.getTheatreId() != null
                ? facilityService.requireTheatre(tenantId, procedure.getTheatreId()) : null;
        OtScheduleEntity schedule = procedure.getScheduleId() != null
                ? requireSchedule(tenantId, procedure.getScheduleId()) : null;
        List<OtTeamMemberEntity> team = teamMemberRepository
                .findByProcedureIdAndDeletedAtIsNullOrderByCreatedAtAsc(procedure.getId());
        List<OtNoteEntity> notes = noteRepository
                .findByProcedureIdAndDeletedAtIsNullOrderByRecordedAtAsc(procedure.getId());
        return mapper.toProcedureResponse(procedure, theatre, schedule, team, notes);
    }

    private OtProcedureEntity requireProcedure(UUID tenantId, UUID procedureId) {
        return procedureRepository.findByIdAndTenantIdAndDeletedAtIsNull(procedureId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "OT procedure not found"));
    }

    private OtScheduleEntity requireSchedule(UUID tenantId, UUID scheduleId) {
        return scheduleRepository.findByIdAndTenantIdAndDeletedAtIsNull(scheduleId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "OT schedule not found"));
    }

    private void assertStatus(OtProcedureEntity procedure, OtProcedureStatus expected) {
        if (!expected.name().equals(procedure.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Procedure must be in " + expected.name() + " status");
        }
    }

    private OtTeamRole parseTeamRole(String value) {
        try {
            return OtTeamRole.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid team role: " + value);
        }
    }

    private OtNoteType parseNoteType(String value) {
        try {
            return OtNoteType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid note type: " + value);
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
