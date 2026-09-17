package com.health360.emergency.application.service;

import com.health360.adt.application.service.AdtFacade;
import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.request.UpdateEncounterStatusRequest;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.emergency.infrastructure.persistence.entity.EdVisitEntity;
import com.health360.emergency.infrastructure.persistence.repository.EdVisitRepository;
import com.health360.emergency.presentation.dto.request.CreateEdVisitRequest;
import com.health360.emergency.presentation.dto.request.DisposeEdVisitRequest;
import com.health360.emergency.presentation.dto.request.TriageEdVisitRequest;
import com.health360.emergency.presentation.dto.response.EdVisitResponse;
import com.health360.icu.presentation.dto.request.CreateIcuStayRequest;
import com.health360.icu.presentation.dto.response.IcuStayResponse;
import com.health360.ipd.presentation.dto.request.CreateIpdAdmissionRequest;
import com.health360.ipd.presentation.dto.response.IpdAdmissionResponse;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmergencyService {

    private static final Set<String> ARRIVAL_MODES = Set.of(
            "WALK_IN", "AMBULANCE", "POLICE", "TRANSFER_IN", "OTHER");
    private static final Set<String> DISPOSITIONS = Set.of(
            "DISCHARGE_HOME", "ADMIT_IPD", "ADMIT_ICU", "TRANSFER_OUT",
            "LEFT_WITHOUT_BEING_SEEN", "REFER", "DEATH");
    private static final List<String> ACTIVE_STATUSES = List.of("ARRIVED", "TRIAGED", "IN_TREATMENT");

    private final EdVisitRepository visitRepository;
    private final EncounterService encounterService;
    private final EncounterRepository encounterRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final EmergencyAccessService accessService;
    private final EventPublisher eventPublisher;
    private final AuditLogService auditLogService;
    private final AdtFacade adtFacade;

    @Transactional
    public EdVisitResponse registerArrival(UserPrincipal principal, CreateEdVisitRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId());

        String mode = request.getArrivalMode().trim().toUpperCase(Locale.ROOT);
        if (!ARRIVAL_MODES.contains(mode)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid arrival mode");
        }

        PatientProfileEntity patient = patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getPatientId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient not found"));

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(request.getPatientId());
        encounterRequest.setHospitalId(request.getHospitalId());
        encounterRequest.setBranchId(request.getBranchId());
        encounterRequest.setEncounterType("EMERGENCY");
        encounterRequest.setVisitReason(trimToNull(request.getChiefComplaint()));
        EncounterResponse encounterResponse = encounterService.createEncounter(principal, encounterRequest);

        UpdateEncounterStatusRequest inProgress = new UpdateEncounterStatusRequest();
        inProgress.setStatus(EncounterStatus.IN_PROGRESS.name());
        encounterService.updateEncounterStatus(principal, encounterResponse.getEncounterId(), inProgress);

        EdVisitEntity visit = new EdVisitEntity();
        visit.setTenantId(principal.getTenantId());
        visit.setHospitalId(request.getHospitalId());
        visit.setBranchId(request.getBranchId());
        visit.setPatientId(request.getPatientId());
        visit.setEncounterId(encounterResponse.getEncounterId());
        visit.setVisitNumber(allocateVisitNumber(request.getHospitalId()));
        visit.setStatus("ARRIVED");
        visit.setArrivalMode(mode);
        visit.setChiefComplaint(trimToNull(request.getChiefComplaint()));
        visit.setArrivedAt(Instant.now());
        visit.setCreatedBy(principal.getUserId());
        visit.setUpdatedBy(principal.getUserId());
        EdVisitEntity saved = visitRepository.save(visit);

        Map<String, Object> payload = new HashMap<>();
        payload.put("visitNumber", saved.getVisitNumber());
        payload.put("arrivalMode", saved.getArrivalMode());
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.ED_ARRIVAL)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .entityType("EdVisit")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("ED")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ED_VISIT_ARRIVED",
                "EdVisit", saved.getId(), Map.of("visitNumber", saved.getVisitNumber()));

        return toResponse(principal.getTenantId(), saved, patient, encounterResponse.getEncounterNumber());
    }

    @Transactional(readOnly = true)
    public Page<EdVisitResponse> listBoard(
            UserPrincipal principal, UUID hospitalId, UUID branchId, boolean activeOnly, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId);

        Page<EdVisitEntity> page = activeOnly
                ? visitRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNullOrderByArrivedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, ACTIVE_STATUSES, pageable)
                : visitRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByArrivedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(v -> toResponse(principal.getTenantId(), v, null, null));
    }

    @Transactional
    public EdVisitResponse triage(UserPrincipal principal, UUID visitId, TriageEdVisitRequest request) {
        accessService.assertCanWrite(principal);
        EdVisitEntity visit = require(principal.getTenantId(), visitId);
        accessService.assertModuleEnabled(principal, visit.getHospitalId());

        if (!"ARRIVED".equals(visit.getStatus()) && !"TRIAGED".equals(visit.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only arrived/triaged visits can be triaged");
        }

        visit.setTriageAcuity(request.getTriageAcuity());
        visit.setTriageNotes(trimToNull(request.getTriageNotes()));
        visit.setTriagedAt(Instant.now());
        visit.setTriagedBy(principal.getUserId());
        visit.setStatus("TRIAGED");
        visit.setUpdatedBy(principal.getUserId());
        EdVisitEntity saved = visitRepository.save(visit);

        Map<String, Object> payload = new HashMap<>();
        payload.put("visitNumber", saved.getVisitNumber());
        payload.put("triageAcuity", saved.getTriageAcuity());
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.ED_TRIAGED)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .entityType("EdVisit")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("ED")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ED_VISIT_TRIAGED",
                "EdVisit", saved.getId(), Map.of("acuity", String.valueOf(saved.getTriageAcuity())));

        return toResponse(principal.getTenantId(), saved, null, null);
    }

    @Transactional
    public EdVisitResponse dispose(UserPrincipal principal, UUID visitId, DisposeEdVisitRequest request) {
        accessService.assertCanDisposition(principal);
        EdVisitEntity visit = require(principal.getTenantId(), visitId);
        accessService.assertModuleEnabled(principal, visit.getHospitalId());

        if ("DISPOSITIONED".equals(visit.getStatus()) || "CANCELLED".equals(visit.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Visit already closed");
        }

        String disposition = request.getDisposition().trim().toUpperCase(Locale.ROOT);
        if (!DISPOSITIONS.contains(disposition)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid disposition");
        }

        UUID resultingAdmissionId = request.getResultingAdmissionId();
        if ("ADMIT_IPD".equals(disposition) && resultingAdmissionId == null) {
            resultingAdmissionId = admitToIpdViaAdt(principal, visit, request);
        } else if ("ADMIT_ICU".equals(disposition) && resultingAdmissionId == null) {
            resultingAdmissionId = admitToIcuViaAdt(principal, visit, request);
        }

        Instant now = Instant.now();
        visit.setDisposition(disposition);
        visit.setDispositionNotes(trimToNull(request.getDispositionNotes()));
        visit.setDispositionAt(now);
        visit.setDispositionBy(principal.getUserId());
        visit.setResultingAdmissionId(resultingAdmissionId);
        visit.setStatus("DISPOSITIONED");
        visit.setUpdatedBy(principal.getUserId());
        EdVisitEntity saved = visitRepository.save(visit);

        if (visit.getEncounterId() != null) {
            UpdateEncounterStatusRequest completed = new UpdateEncounterStatusRequest();
            completed.setStatus(EncounterStatus.COMPLETED.name());
            encounterService.updateEncounterStatus(principal, visit.getEncounterId(), completed);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("visitNumber", saved.getVisitNumber());
        payload.put("disposition", disposition);
        if (saved.getResultingAdmissionId() != null) {
            payload.put("resultingAdmissionId", saved.getResultingAdmissionId().toString());
        }
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.ED_DISPOSITION)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .entityType("EdVisit")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("ED")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ED_VISIT_DISPOSITIONED",
                "EdVisit", saved.getId(), Map.of("disposition", disposition));

        return toResponse(principal.getTenantId(), saved, null, null);
    }

    private UUID admitToIpdViaAdt(
            UserPrincipal principal, EdVisitEntity visit, DisposeEdVisitRequest request) {
        if (request.getBedId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "bedId is required for ADMIT_IPD");
        }
        if (request.getPrimaryDoctorId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "primaryDoctorId is required for ADMIT_IPD");
        }
        CreateIpdAdmissionRequest admit = new CreateIpdAdmissionRequest();
        admit.setPatientId(visit.getPatientId());
        admit.setHospitalId(visit.getHospitalId());
        admit.setBranchId(visit.getBranchId());
        admit.setBedId(request.getBedId());
        admit.setPrimaryDoctorId(request.getPrimaryDoctorId());
        admit.setAdmissionSource("EMERGENCY");
        admit.setAdmissionType("EMERGENCY");
        admit.setAdmissionReason(trimToNull(request.getDispositionNotes()) != null
                ? request.getDispositionNotes().trim()
                : ("ED disposition from " + visit.getVisitNumber()));
        IpdAdmissionResponse response = adtFacade.admit(principal, admit);
        return response.getAdmissionId();
    }

    private UUID admitToIcuViaAdt(
            UserPrincipal principal, EdVisitEntity visit, DisposeEdVisitRequest request) {
        if (request.getBedId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "bedId is required for ADMIT_ICU");
        }
        CreateIcuStayRequest admit = new CreateIcuStayRequest();
        admit.setPatientId(visit.getPatientId());
        admit.setHospitalId(visit.getHospitalId());
        admit.setBranchId(visit.getBranchId());
        admit.setBedId(request.getBedId());
        admit.setPrimaryDoctorId(request.getPrimaryDoctorId());
        admit.setAdmissionReason(trimToNull(request.getDispositionNotes()) != null
                ? request.getDispositionNotes().trim()
                : ("ED disposition from " + visit.getVisitNumber()));
        IcuStayResponse response = adtFacade.admitIcu(principal, admit);
        return response.getStayId();
    }

    private EdVisitEntity require(UUID tenantId, UUID visitId) {
        return visitRepository.findByIdAndTenantIdAndDeletedAtIsNull(visitId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "ED visit not found"));
    }

    private String allocateVisitNumber(UUID hospitalId) {
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return "ED-" + year + "-" + suffix;
    }

    private EdVisitResponse toResponse(
            UUID tenantId, EdVisitEntity visit, PatientProfileEntity patientPrefetch, String encounterNumberPrefetch) {
        PatientProfileEntity patient = patientPrefetch;
        if (patient == null) {
            patient = patientProfileRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(visit.getPatientId(), tenantId)
                    .orElse(null);
        }
        String encounterNumber = encounterNumberPrefetch;
        if (encounterNumber == null && visit.getEncounterId() != null) {
            EncounterEntity encounter = encounterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(visit.getEncounterId(), tenantId)
                    .orElse(null);
            if (encounter != null) {
                encounterNumber = encounter.getEncounterNumber();
            }
        }

        EdVisitResponse r = new EdVisitResponse();
        r.setId(visit.getId());
        r.setHospitalId(visit.getHospitalId());
        r.setBranchId(visit.getBranchId());
        r.setPatientId(visit.getPatientId());
        if (patient != null) {
            String name = ((patient.getLegalFirstName() != null ? patient.getLegalFirstName() : "")
                    + " "
                    + (patient.getLegalLastName() != null ? patient.getLegalLastName() : "")).trim();
            r.setPatientName(name.isEmpty() ? null : name);
        }
        r.setEncounterId(visit.getEncounterId());
        r.setEncounterNumber(encounterNumber);
        r.setVisitNumber(visit.getVisitNumber());
        r.setStatus(visit.getStatus());
        r.setArrivalMode(visit.getArrivalMode());
        r.setChiefComplaint(visit.getChiefComplaint());
        r.setTriageAcuity(visit.getTriageAcuity());
        r.setTriageNotes(visit.getTriageNotes());
        r.setTriagedAt(visit.getTriagedAt());
        r.setDisposition(visit.getDisposition());
        r.setDispositionAt(visit.getDispositionAt());
        r.setDispositionNotes(visit.getDispositionNotes());
        r.setResultingAdmissionId(visit.getResultingAdmissionId());
        r.setArrivedAt(visit.getArrivedAt());
        return r;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
