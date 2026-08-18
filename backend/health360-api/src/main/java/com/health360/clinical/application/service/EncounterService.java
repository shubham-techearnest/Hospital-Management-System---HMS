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
    private final ClinicalMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public EncounterResponse createEncounter(
            UserPrincipal principal, CreateEncounterRequest request) {
        if (!principal.hasPermission("clinical:encounter:write")) {
            throw forbidden();
        }

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

        EncounterEntity encounter = new EncounterEntity();
        encounter.setTenantId(tenantId);
        encounter.setEncounterNumber(generateEncounterNumber(tenantId, request.getHospitalId()));
        encounter.setPatientId(request.getPatientId());
        encounter.setHospitalId(request.getHospitalId());
        encounter.setBranchId(request.getBranchId());
        encounter.setDepartmentId(request.getDepartmentId());
        encounter.setPrimaryDoctorId(doctorId);
        encounter.setAppointmentId(request.getAppointmentId());
        encounter.setEncounterType(parseEncounterType(request.getEncounterType()).name());
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

        ClinicalNoteEntity note = new ClinicalNoteEntity();
        note.setTenantId(principal.getTenantId());
        note.setEncounterId(encounterId);
        note.setNoteType(parseNoteType(request.getNoteType()).name());
        note.setContent(request.getContent().trim());
        note.setCreatedBy(principal.getUserId());
        note.setUpdatedBy(principal.getUserId());

        ClinicalNoteEntity saved = noteRepository.save(note);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "CLINICAL_NOTE_ADDED", "ClinicalNote", saved.getId(),
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

    private String generateEncounterNumber(UUID tenantId, UUID hospitalId) {
        long sequence = encounterRepository.countByTenantIdAndHospitalIdAndDeletedAtIsNull(tenantId, hospitalId) + 1;
        String hospitalPrefix = hospitalId.toString().substring(0, 8).toUpperCase();
        return "ENC-" + hospitalPrefix + "-" + String.format("%06d", sequence);
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
