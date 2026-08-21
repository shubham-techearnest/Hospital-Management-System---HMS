package com.health360.clinical.application.service;

import com.health360.clinical.domain.*;
import com.health360.clinical.infrastructure.persistence.entity.*;
import com.health360.clinical.infrastructure.persistence.repository.*;
import com.health360.clinical.presentation.dto.request.*;
import com.health360.clinical.presentation.dto.response.*;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.DepartmentEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EncounterService {

    private final EncounterRepository encounterRepository;
    private final ClinicalDiagnosisRepository diagnosisRepository;
    private final ClinicalNoteRepository noteRepository;
    private final AppointmentRepository appointmentRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final EncounterAccessService accessService;
    private final EncounterNumberService encounterNumberService;
    private final ClinicalMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public EncounterResponse createEncounter(
            UserPrincipal principal, CreateEncounterRequest request) {
        if (!principal.hasPermission("clinical:encounter:write")) {
            throw forbidden();
        }
        return doCreateEncounter(principal, request);
    }

    /**
     * Creates an encounter for OPD registration / appointment arrive flows.
     * Caller must already authorize via opd:registration:write or scheduling:appointment:arrive.
     */
    @Transactional
    public EncounterResponse createEncounterForRegistration(
            UserPrincipal principal, CreateEncounterRequest request) {
        return doCreateEncounter(principal, request);
    }

    /**
     * Transitions REGISTERED → WAITING for registration/arrive flows without clinical:encounter:write.
     */
    @Transactional
    public EncounterResponse markWaitingForRegistration(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        EncounterStatus current = parseEncounterStatus(encounter.getStatus());
        if (current == EncounterStatus.WAITING) {
            return mapper.toEncounterResponse(encounter);
        }
        if (current != EncounterStatus.REGISTERED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Cannot mark encounter waiting from " + current);
        }
        encounter.setStatus(EncounterStatus.WAITING.name());
        encounter.setUpdatedBy(principal.getUserId());
        applyStatusTimestamps(encounter, EncounterStatus.WAITING);
        encounterRepository.save(encounter);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "ENCOUNTER_STATUS_UPDATED", "Encounter", encounter.getId(),
                Map.of("status", EncounterStatus.WAITING.name(), "source", "REGISTRATION"));

        return mapper.toEncounterResponse(encounter);
    }

    private EncounterResponse doCreateEncounter(UserPrincipal principal, CreateEncounterRequest request) {
        UUID tenantId = principal.getTenantId();
        UUID userId = principal.getUserId();

        accessService.requirePatient(tenantId, request.getPatientId());
        accessService.requireHospital(tenantId, request.getHospitalId());
        requireBranch(tenantId, request.getHospitalId(), request.getBranchId());

        if (request.getDepartmentId() != null) {
            requireDepartment(tenantId, request.getHospitalId(), request.getDepartmentId());
        }

        UUID doctorId = request.getPrimaryDoctorId();
        if (doctorId != null) {
            accessService.requireDoctor(tenantId, doctorId);
        } else if (principal.getRoles().contains("DOCTOR")) {
            doctorId = accessService.resolveDoctorProfileIdForUser(userId, tenantId);
        }

        if (request.getAppointmentId() != null) {
            validateAppointmentLink(tenantId, request);
        }

        EncounterType encounterType = parseEncounterType(request.getEncounterType());
        EncounterEntity encounter = new EncounterEntity();
        encounter.setTenantId(tenantId);
        encounter.setEncounterNumber(encounterNumberService.allocateEncounterNumber(
                tenantId, request.getHospitalId(), encounterType));
        encounter.setPatientId(request.getPatientId());
        encounter.setHospitalId(request.getHospitalId());
        encounter.setBranchId(request.getBranchId());
        encounter.setDepartmentId(request.getDepartmentId());
        encounter.setPrimaryDoctorId(doctorId);
        encounter.setAppointmentId(request.getAppointmentId());
        encounter.setEncounterType(encounterType.name());
        encounter.setStatus(EncounterStatus.REGISTERED.name());
        encounter.setVisitReason(trimToNull(request.getVisitReason()));
        encounter.setCreatedBy(userId);
        encounter.setUpdatedBy(userId);

        EncounterEntity saved = encounterRepository.save(encounter);

        auditLogService.record(tenantId, userId, "ENCOUNTER_CREATED", "Encounter", saved.getId(),
                Map.of("encounterNumber", saved.getEncounterNumber(), "patientId", saved.getPatientId().toString()));

        return mapper.toEncounterResponse(saved);
    }

    @Transactional(readOnly = true)
    public EncounterResponse getEncounter(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);
        return mapper.toEncounterResponse(encounter);
    }

    @Transactional(readOnly = true)
    public Page<EncounterResponse> listEncounters(
            UserPrincipal principal,
            UUID patientId,
            UUID hospitalId,
            UUID doctorId,
            Pageable pageable) {
        UUID tenantId = principal.getTenantId();

        if (principal.getRoles().contains("PATIENT")
                && !principal.hasPermission("clinical:encounter:write")) {
            UUID ownPatientId = accessService.resolvePatientProfileIdForUser(
                    principal.getUserId(), tenantId);
            if (ownPatientId == null) {
                return Page.empty(pageable);
            }
            patientId = ownPatientId;
        }

        Page<EncounterEntity> page;
        if (patientId != null) {
            page = encounterRepository.findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                    tenantId, patientId, pageable);
        } else if (doctorId != null) {
            page = encounterRepository.findByTenantIdAndPrimaryDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                    tenantId, doctorId, pageable);
        } else if (hospitalId != null) {
            page = encounterRepository.findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                    tenantId, hospitalId, pageable);
        } else if (principal.getRoles().contains("DOCTOR")) {
            UUID ownDoctorId = accessService.resolveDoctorProfileIdForUser(
                    principal.getUserId(), tenantId);
            if (ownDoctorId == null) {
                return Page.empty(pageable);
            }
            page = encounterRepository.findByTenantIdAndPrimaryDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                    tenantId, ownDoctorId, pageable);
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Provide patientId, hospitalId, or doctorId filter");
        }

        return page.map(mapper::toEncounterResponse);
    }

    @Transactional(readOnly = true)
    public Page<EncounterResponse> listMyEncounters(UserPrincipal principal, Pageable pageable) {
        UUID tenantId = principal.getTenantId();
        UUID patientId = accessService.resolvePatientProfileIdForUser(principal.getUserId(), tenantId);
        if (patientId == null) {
            return Page.empty(pageable);
        }
        return encounterRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, patientId, pageable)
                .map(mapper::toEncounterResponse);
    }

    @Transactional(readOnly = true)
    public Page<EncounterResponse> listDoctorMyEncounters(
            UserPrincipal principal,
            boolean todayOnly,
            String status,
            Pageable pageable) {
        if (!principal.hasPermission("clinical:encounter:read")) {
            throw forbidden();
        }
        UUID tenantId = principal.getTenantId();
        UUID doctorId = accessService.resolveDoctorProfileIdForUser(principal.getUserId(), tenantId);
        if (doctorId == null) {
            return Page.empty(pageable);
        }

        if (!todayOnly && (status == null || status.isBlank())) {
            return encounterRepository
                    .findByTenantIdAndPrimaryDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                            tenantId, doctorId, pageable)
                    .map(mapper::toEncounterResponse);
        }

        Instant from = null;
        Instant to = null;
        String encounterType = null;
        if (todayOnly) {
            LocalDate today = LocalDate.now(ZoneId.systemDefault());
            from = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
            to = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            encounterType = EncounterType.OPD.name();
        }

        String normalizedStatus = status != null && !status.isBlank()
                ? parseEncounterStatus(status).name() : null;

        return encounterRepository.findDoctorEncountersFiltered(
                        tenantId, doctorId, encounterType, from, to, normalizedStatus, pageable)
                .map(mapper::toEncounterResponse);
    }

    @Transactional(readOnly = true)
    public Page<EncounterResponse> listHospitalEncounters(
            UserPrincipal principal, UUID hospitalId, Pageable pageable) {
        if (!principal.hasPermission("clinical:encounter:read")) {
            throw forbidden();
        }
        accessService.requireHospital(principal.getTenantId(), hospitalId);
        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            accessService.assertHospitalAdminScope(principal, hospitalId);
        }
        return encounterRepository
                .findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, pageable)
                .map(mapper::toEncounterResponse);
    }

    @Transactional
    public EncounterResponse checkInEncounter(UserPrincipal principal, UUID encounterId) {
        return transitionEncounter(principal, encounterId, EncounterStatus.WAITING);
    }

    @Transactional
    public EncounterResponse startEncounter(UserPrincipal principal, UUID encounterId) {
        return transitionEncounter(principal, encounterId, EncounterStatus.IN_PROGRESS);
    }

    @Transactional
    public EncounterResponse completeEncounter(UserPrincipal principal, UUID encounterId) {
        return transitionEncounter(principal, encounterId, EncounterStatus.COMPLETED);
    }

    private EncounterResponse transitionEncounter(
            UserPrincipal principal, UUID encounterId, EncounterStatus target) {
        UpdateEncounterStatusRequest request = new UpdateEncounterStatusRequest();
        request.setStatus(target.name());
        return updateEncounterStatus(principal, encounterId, request);
    }

    @Transactional
    public EncounterResponse updateEncounterStatus(
            UserPrincipal principal, UUID encounterId, UpdateEncounterStatusRequest request) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        EncounterStatus current = parseEncounterStatus(encounter.getStatus());
        EncounterStatus target = parseEncounterStatus(request.getStatus());

        if (!current.canTransitionTo(target)) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Cannot transition encounter from " + current + " to " + target);
        }

        encounter.setStatus(target.name());
        encounter.setUpdatedBy(principal.getUserId());
        applyStatusTimestamps(encounter, target);
        encounterRepository.save(encounter);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "ENCOUNTER_STATUS_UPDATED", "Encounter", encounter.getId(),
                Map.of("status", target.name()));

        return mapper.toEncounterResponse(encounter);
    }

    @Transactional
    public DiagnosisResponse addDiagnosis(
            UserPrincipal principal, UUID encounterId, CreateDiagnosisRequest request) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        ClinicalDiagnosisEntity diagnosis = new ClinicalDiagnosisEntity();
        diagnosis.setTenantId(principal.getTenantId());
        diagnosis.setEncounterId(encounterId);
        diagnosis.setDiagnosisCode(trimToNull(request.getDiagnosisCode()));
        diagnosis.setDiagnosisText(request.getDiagnosisText().trim());
        diagnosis.setDiagnosisType(parseDiagnosisType(request.getDiagnosisType()).name());
        diagnosis.setNotes(trimToNull(request.getNotes()));
        diagnosis.setCreatedBy(principal.getUserId());
        diagnosis.setUpdatedBy(principal.getUserId());

        ClinicalDiagnosisEntity saved = diagnosisRepository.save(diagnosis);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "CLINICAL_DIAGNOSIS_ADDED", "ClinicalDiagnosis", saved.getId(),
                Map.of("encounterId", encounterId.toString()));

        return mapper.toDiagnosisResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DiagnosisResponse> listDiagnoses(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);
        return diagnosisRepository.findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(encounterId)
                .stream().map(mapper::toDiagnosisResponse).toList();
    }

    @Transactional
    public ClinicalNoteResponse addNote(
            UserPrincipal principal, UUID encounterId, CreateClinicalNoteRequest request) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        boolean structured = hasStructuredSections(
                request.getChiefComplaint(), request.getHpi(), request.getExamination(),
                request.getAssessment(), request.getPlan());

        String content = trimToNull(request.getContent());
        if (structured) {
            content = buildConsultationSummary(request.getChiefComplaint(), request.getHpi(),
                    request.getExamination(), request.getAssessment(), request.getPlan(), content);
        }
        if (content == null || content.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Note content or structured consultation sections are required");
        }

        ClinicalNoteEntity note = new ClinicalNoteEntity();
        note.setTenantId(principal.getTenantId());
        note.setEncounterId(encounterId);
        note.setNoteType(structured
                ? ClinicalNoteType.CONSULTATION.name()
                : parseNoteType(request.getNoteType()).name());
        note.setContent(content);
        note.setChiefComplaint(trimToNull(request.getChiefComplaint()));
        note.setHpi(trimToNull(request.getHpi()));
        note.setExamination(trimToNull(request.getExamination()));
        note.setAssessment(trimToNull(request.getAssessment()));
        note.setPlan(trimToNull(request.getPlan()));
        if (structured) {
            note.setStatus("DRAFT");
        } else {
            note.setStatus("FINAL");
            note.setFinalizedAt(Instant.now());
            note.setFinalizedBy(principal.getUserId());
        }
        note.setCreatedBy(principal.getUserId());
        note.setUpdatedBy(principal.getUserId());

        ClinicalNoteEntity saved = noteRepository.save(note);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "CLINICAL_NOTE_ADDED", "ClinicalNote", saved.getId(),
                Map.of("encounterId", encounterId.toString(), "status", saved.getStatus()));

        return mapper.toNoteResponse(saved);
    }

    @Transactional
    public ClinicalNoteResponse updateNote(
            UserPrincipal principal, UUID encounterId, UUID noteId, UpdateClinicalNoteRequest request) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        ClinicalNoteEntity note = noteRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(noteId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical note not found"));

        if (!note.getEncounterId().equals(encounterId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Note does not belong to this encounter");
        }
        if (!"DRAFT".equals(note.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.CONFLICT,
                    "Only DRAFT notes can be updated");
        }

        if (request.getChiefComplaint() != null) {
            note.setChiefComplaint(trimToNull(request.getChiefComplaint()));
        }
        if (request.getHpi() != null) {
            note.setHpi(trimToNull(request.getHpi()));
        }
        if (request.getExamination() != null) {
            note.setExamination(trimToNull(request.getExamination()));
        }
        if (request.getAssessment() != null) {
            note.setAssessment(trimToNull(request.getAssessment()));
        }
        if (request.getPlan() != null) {
            note.setPlan(trimToNull(request.getPlan()));
        }

        String content = trimToNull(request.getContent());
        boolean structured = hasStructuredSections(
                note.getChiefComplaint(), note.getHpi(), note.getExamination(),
                note.getAssessment(), note.getPlan());
        if (structured) {
            note.setContent(buildConsultationSummary(
                    note.getChiefComplaint(), note.getHpi(), note.getExamination(),
                    note.getAssessment(), note.getPlan(), content));
        } else if (content != null) {
            note.setContent(content);
        }
        note.setUpdatedBy(principal.getUserId());

        ClinicalNoteEntity saved = noteRepository.save(note);
        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "CLINICAL_NOTE_UPDATED", "ClinicalNote", saved.getId(),
                Map.of("encounterId", encounterId.toString()));

        return mapper.toNoteResponse(saved);
    }

    @Transactional
    public ClinicalNoteResponse finalizeNote(
            UserPrincipal principal, UUID encounterId, UUID noteId) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        ClinicalNoteEntity note = noteRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(noteId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical note not found"));

        if (!note.getEncounterId().equals(encounterId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Note does not belong to this encounter");
        }
        if (!"DRAFT".equals(note.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.CONFLICT,
                    "Only DRAFT notes can be finalized");
        }

        note.setStatus("FINAL");
        note.setFinalizedAt(Instant.now());
        note.setFinalizedBy(principal.getUserId());
        note.setUpdatedBy(principal.getUserId());

        ClinicalNoteEntity saved = noteRepository.save(note);
        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "CLINICAL_NOTE_FINALIZED", "ClinicalNote", saved.getId(),
                Map.of("encounterId", encounterId.toString()));

        return mapper.toNoteResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClinicalNoteResponse> listNotes(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);
        return noteRepository.findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(encounterId)
                .stream().map(mapper::toNoteResponse).toList();
    }

    private boolean hasStructuredSections(String... sections) {
        return Arrays.stream(sections).anyMatch(s -> s != null && !s.isBlank());
    }

    private String buildConsultationSummary(
            String chiefComplaint, String hpi, String examination, String assessment, String plan,
            String fallbackContent) {
        StringBuilder sb = new StringBuilder();
        appendSection(sb, "Chief complaint", chiefComplaint);
        appendSection(sb, "HPI", hpi);
        appendSection(sb, "Examination", examination);
        appendSection(sb, "Assessment", assessment);
        appendSection(sb, "Plan", plan);
        if (sb.isEmpty() && fallbackContent != null && !fallbackContent.isBlank()) {
            return fallbackContent.trim();
        }
        return sb.toString().trim();
    }

    private void appendSection(StringBuilder sb, String label, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        if (!sb.isEmpty()) {
            sb.append("\n\n");
        }
        sb.append(label).append(":\n").append(value.trim());
    }

    EncounterEntity requireEncounter(UUID tenantId, UUID encounterId) {
        return encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
    }

    private void validateAppointmentLink(UUID tenantId, CreateEncounterRequest request) {
        AppointmentEntity appointment = appointmentRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getAppointmentId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Appointment not found"));

        if (!appointment.getPatientId().equals(request.getPatientId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Appointment does not belong to the specified patient");
        }

        if (encounterRepository.existsByTenantIdAndAppointmentIdAndDeletedAtIsNull(
                tenantId, request.getAppointmentId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "An encounter already exists for this appointment");
        }
    }

    private void requireBranch(UUID tenantId, UUID hospitalId, UUID branchId) {
        BranchEntity branch = branchRepository.findById(branchId)
                .filter(b -> b.getDeletedAt() == null && b.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Branch not found"));
        if (!branch.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Branch does not belong to the specified hospital");
        }
    }

    private void requireDepartment(UUID tenantId, UUID hospitalId, UUID departmentId) {
        DepartmentEntity department = departmentRepository.findById(departmentId)
                .filter(d -> d.getDeletedAt() == null && d.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Department not found"));
        if (!department.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Department does not belong to the specified hospital");
        }
    }

    private void applyStatusTimestamps(EncounterEntity encounter, EncounterStatus status) {
        Instant now = Instant.now();
        if (status == EncounterStatus.IN_PROGRESS && encounter.getStartedAt() == null) {
            encounter.setStartedAt(now);
        }
        if (status == EncounterStatus.COMPLETED) {
            encounter.setEndedAt(now);
            if (encounter.getStartedAt() == null) {
                encounter.setStartedAt(now);
            }
        }
    }

    private EncounterType parseEncounterType(String raw) {
        try {
            return EncounterType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid encounter type. Allowed: "
                            + Arrays.toString(EncounterType.values()));
        }
    }

    private EncounterStatus parseEncounterStatus(String raw) {
        try {
            return EncounterStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid encounter status. Allowed: "
                            + Arrays.toString(EncounterStatus.values()));
        }
    }

    private DiagnosisType parseDiagnosisType(String raw) {
        if (raw == null || raw.isBlank()) {
            return DiagnosisType.PRIMARY;
        }
        try {
            return DiagnosisType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid diagnosis type");
        }
    }

    private ClinicalNoteType parseNoteType(String raw) {
        if (raw == null || raw.isBlank()) {
            return ClinicalNoteType.GENERAL;
        }
        try {
            return ClinicalNoteType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid note type");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
