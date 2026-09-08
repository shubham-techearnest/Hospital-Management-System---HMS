package com.health360.ipd.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.ipd.domain.AdmissionCatalogs;
import com.health360.ipd.domain.AdmissionRequestStatus;
import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionRequestEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdBedEntity;
import com.health360.ipd.infrastructure.persistence.repository.IpdAdmissionRequestRepository;
import com.health360.ipd.presentation.dto.request.CreateAdmissionRequestPayload;
import com.health360.ipd.presentation.dto.request.ReserveAdmissionBedRequest;
import com.health360.ipd.presentation.dto.request.ReviewAdmissionRequestPayload;
import com.health360.ipd.presentation.dto.response.IpdAdmissionRequestResponse;
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
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IpdAdmissionRequestService {

    private static final Set<String> TERMINAL_FOR_DUPLICATE = Set.of(
            AdmissionRequestStatus.REJECTED.name(),
            AdmissionRequestStatus.CANCELLED.name(),
            AdmissionRequestStatus.ADMITTED.name()
    );

    private final IpdAdmissionRequestRepository requestRepository;
    private final EncounterRepository encounterRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final IpdAccessService accessService;
    private final IpdFacilityService facilityService;
    private final AuditLogService auditLogService;

    @Transactional
    public IpdAdmissionRequestResponse create(UserPrincipal principal, CreateAdmissionRequestPayload request) {
        accessService.assertCanCreateAdmissionRequest(principal);
        accessService.assertIpdServiceEnabled(
                principal,
                request.getHospitalId(),
                IpdServiceKeys.IPD_PRE_ADMISSION,
                "Pre-admission / admission requests are disabled for this hospital");

        String source;
        String type;
        String priority;
        try {
            source = AdmissionCatalogs.requireSource(request.getAdmissionSource());
            type = AdmissionCatalogs.requireType(request.getAdmissionType());
            priority = AdmissionCatalogs.requirePriority(request.getPriority());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        if ("OPD".equals(source)) {
            accessService.assertIpdServiceEnabled(
                    principal,
                    request.getHospitalId(),
                    IpdServiceKeys.IPD_OPD_ADMIT_REQUEST,
                    "OPD → IPD admission requests are disabled for this hospital");
            if (request.getSourceEncounterId() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "sourceEncounterId is required for OPD admission requests");
            }
        }
        if ("EMERGENCY".equals(source) || "EMERGENCY".equals(type)) {
            accessService.assertIpdServiceEnabled(
                    principal,
                    request.getHospitalId(),
                    IpdServiceKeys.IPD_EMERGENCY_ADMIT,
                    "Emergency admission source is disabled for this hospital");
        }
        if ("DAY_CARE".equals(source) || "OBSERVATION".equals(type)) {
            accessService.assertIpdServiceEnabled(
                    principal,
                    request.getHospitalId(),
                    IpdServiceKeys.IPD_DAY_CARE,
                    "Day-care / observation admissions are disabled for this hospital");
        }

        PatientProfileEntity patient = patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getPatientId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient not found"));

        EncounterEntity sourceEncounter = null;
        if (request.getSourceEncounterId() != null) {
            sourceEncounter = encounterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(request.getSourceEncounterId(), principal.getTenantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Source encounter not found"));
            if (!sourceEncounter.getPatientId().equals(request.getPatientId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Source encounter does not belong to the selected patient");
            }
            if (!sourceEncounter.getHospitalId().equals(request.getHospitalId())
                    || !sourceEncounter.getBranchId().equals(request.getBranchId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Source encounter hospital/branch mismatch");
            }
            if (requestRepository.existsBySourceEncounterIdAndStatusNotInAndDeletedAtIsNull(
                    sourceEncounter.getId(), TERMINAL_FOR_DUPLICATE)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "An open admission request already exists for this encounter");
            }
        }

        IpdAdmissionRequestEntity entity = new IpdAdmissionRequestEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setPatientId(request.getPatientId());
        entity.setSourceEncounterId(request.getSourceEncounterId());
        entity.setReferringDoctorId(request.getReferringDoctorId() != null
                ? request.getReferringDoctorId()
                : (sourceEncounter != null ? sourceEncounter.getPrimaryDoctorId() : null));
        entity.setAttendingDoctorId(request.getAttendingDoctorId());
        entity.setDepartmentId(request.getDepartmentId());
        entity.setRequestNumber(allocateRequestNumber(request.getHospitalId()));
        entity.setAdmissionSource(source);
        entity.setAdmissionType(type);
        entity.setStatus(AdmissionRequestStatus.REQUESTED.name());
        entity.setPriority(priority);
        entity.setReasonForAdmission(trimToNull(request.getReasonForAdmission()));
        entity.setProvisionalDiagnosis(trimToNull(request.getProvisionalDiagnosis()));
        entity.setRequestedCareLevel(trimToNull(request.getRequestedCareLevel()));
        entity.setRequestedRoomCategory(trimToNull(request.getRequestedRoomCategory()));
        entity.setExpectedLosDays(request.getExpectedLosDays());
        entity.setPlannedProcedure(trimToNull(request.getPlannedProcedure()));
        entity.setIsolationRequired(Boolean.TRUE.equals(request.getIsolationRequired()));
        entity.setSpecialRequirements(trimToNull(request.getSpecialRequirements()));
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setRequestedAdmitAt(request.getRequestedAdmitAt());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        IpdAdmissionRequestEntity saved = requestRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_ADMISSION_REQUEST_CREATED",
                "IpdAdmissionRequest", saved.getId(),
                Map.of("requestNumber", saved.getRequestNumber(), "source", source));

        return toResponse(principal.getTenantId(), saved, patient, sourceEncounter);
    }

    @Transactional(readOnly = true)
    public Page<IpdAdmissionRequestResponse> list(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanReadAdmissionRequest(principal);
        accessService.assertIpdModuleEnabled(principal, hospitalId);

        Page<IpdAdmissionRequestEntity> page;
        if (status != null && !status.isBlank()) {
            page = requestRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                            principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable);
        } else {
            page = requestRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                            principal.getTenantId(), hospitalId, branchId, pageable);
        }
        return page.map(entity -> toResponse(principal.getTenantId(), entity, null, null));
    }

    @Transactional(readOnly = true)
    public IpdAdmissionRequestResponse get(UserPrincipal principal, UUID requestId) {
        accessService.assertCanReadAdmissionRequest(principal);
        IpdAdmissionRequestEntity entity = require(principal.getTenantId(), requestId);
        accessService.assertIpdModuleEnabled(principal, entity.getHospitalId());
        return toResponse(principal.getTenantId(), entity, null, null);
    }

    @Transactional
    public IpdAdmissionRequestResponse startReview(UserPrincipal principal, UUID requestId) {
        return transition(principal, requestId, AdmissionRequestStatus.UNDER_REVIEW, null);
    }

    @Transactional
    public IpdAdmissionRequestResponse approve(UserPrincipal principal, UUID requestId, ReviewAdmissionRequestPayload payload) {
        return transition(principal, requestId, AdmissionRequestStatus.APPROVED, payload);
    }

    @Transactional
    public IpdAdmissionRequestResponse reject(UserPrincipal principal, UUID requestId, ReviewAdmissionRequestPayload payload) {
        if (payload == null || payload.getRejectionReason() == null || payload.getRejectionReason().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "rejectionReason is required");
        }
        return transition(principal, requestId, AdmissionRequestStatus.REJECTED, payload);
    }

    @Transactional
    public IpdAdmissionRequestResponse schedule(UserPrincipal principal, UUID requestId, ReviewAdmissionRequestPayload payload) {
        if (payload == null || payload.getScheduledAdmitAt() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "scheduledAdmitAt is required");
        }
        return transition(principal, requestId, AdmissionRequestStatus.SCHEDULED, payload);
    }

    @Transactional
    public IpdAdmissionRequestResponse cancel(UserPrincipal principal, UUID requestId, ReviewAdmissionRequestPayload payload) {
        return transition(principal, requestId, AdmissionRequestStatus.CANCELLED, payload);
    }

    @Transactional
    public IpdAdmissionRequestResponse reserveBed(
            UserPrincipal principal, UUID requestId, ReserveAdmissionBedRequest request) {
        accessService.assertCanReviewAdmissionRequest(principal);
        IpdAdmissionRequestEntity entity = require(principal.getTenantId(), requestId);
        accessService.assertIpdModuleEnabled(principal, entity.getHospitalId());

        AdmissionRequestStatus status = AdmissionRequestStatus.parse(entity.getStatus());
        if (status != AdmissionRequestStatus.APPROVED && status != AdmissionRequestStatus.SCHEDULED) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Reserve bed only for APPROVED or SCHEDULED requests");
        }

        IpdBedEntity bed = facilityService.requireAvailableBed(principal.getTenantId(), request.getBedId());
        var room = facilityService.requireRoom(principal.getTenantId(), bed.getRoomId());
        var ward = facilityService.requireWard(principal.getTenantId(), room.getWardId());
        if (!ward.getHospitalId().equals(entity.getHospitalId())
                || !ward.getBranchId().equals(entity.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Bed does not belong to the request hospital branch");
        }

        if (entity.getReservedBedId() != null && !entity.getReservedBedId().equals(bed.getId())) {
            IpdBedEntity previous = facilityService.requireBed(principal.getTenantId(), entity.getReservedBedId());
            facilityService.clearReservation(previous, principal.getUserId());
        }

        facilityService.reserveBed(bed, principal.getUserId());
        entity.setReservedBedId(bed.getId());
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        IpdAdmissionRequestEntity saved = requestRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_ADMISSION_REQUEST_BED_RESERVED",
                "IpdAdmissionRequest", saved.getId(), Map.of("bedId", bed.getId().toString()));
        return toResponse(principal.getTenantId(), saved, null, null);
    }

    @Transactional(readOnly = true)
    public IpdAdmissionRequestResponse.Catalogs catalogs() {
        return IpdAdmissionRequestResponse.Catalogs.builder()
                .sources(AdmissionCatalogs.SOURCES)
                .types(AdmissionCatalogs.TYPES)
                .priorities(AdmissionCatalogs.PRIORITIES)
                .build();
    }

    @Transactional
    public void markAdmitted(UUID tenantId, UUID requestId, UUID admissionId, UUID actorUserId) {
        IpdAdmissionRequestEntity entity = require(tenantId, requestId);
        AdmissionRequestStatus current = AdmissionRequestStatus.parse(entity.getStatus());
        if (current != AdmissionRequestStatus.APPROVED && current != AdmissionRequestStatus.SCHEDULED) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Admission request must be APPROVED or SCHEDULED before admit");
        }
        if (!current.canTransitionTo(AdmissionRequestStatus.ADMITTED)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid transition to ADMITTED");
        }
        entity.setStatus(AdmissionRequestStatus.ADMITTED.name());
        entity.setResultingAdmissionId(admissionId);
        entity.setReservedBedId(null);
        entity.setUpdatedBy(actorUserId);
        entity.touch();
        requestRepository.save(entity);
    }

    public IpdAdmissionRequestEntity require(UUID tenantId, UUID requestId) {
        return requestRepository.findByIdAndTenantIdAndDeletedAtIsNull(requestId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Admission request not found"));
    }

    private IpdAdmissionRequestResponse transition(
            UserPrincipal principal,
            UUID requestId,
            AdmissionRequestStatus target,
            ReviewAdmissionRequestPayload payload) {
        accessService.assertCanReviewAdmissionRequest(principal);
        IpdAdmissionRequestEntity entity = require(principal.getTenantId(), requestId);
        accessService.assertIpdModuleEnabled(principal, entity.getHospitalId());

        AdmissionRequestStatus current = AdmissionRequestStatus.parse(entity.getStatus());
        if (!current.canTransitionTo(target)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Cannot transition admission request from " + current + " to " + target);
        }

        entity.setStatus(target.name());
        entity.setReviewedAt(Instant.now());
        entity.setReviewedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();

        if (payload != null) {
            if (payload.getReviewNotes() != null) {
                entity.setReviewNotes(trimToNull(payload.getReviewNotes()));
            }
            if (payload.getRejectionReason() != null) {
                entity.setRejectionReason(trimToNull(payload.getRejectionReason()));
            }
            if (payload.getScheduledAdmitAt() != null) {
                entity.setScheduledAdmitAt(payload.getScheduledAdmitAt());
            }
        }

        if ((target == AdmissionRequestStatus.REJECTED || target == AdmissionRequestStatus.CANCELLED)
                && entity.getReservedBedId() != null) {
            IpdBedEntity reserved = facilityService.requireBed(principal.getTenantId(), entity.getReservedBedId());
            facilityService.clearReservation(reserved, principal.getUserId());
            entity.setReservedBedId(null);
        }

        IpdAdmissionRequestEntity saved = requestRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "IPD_ADMISSION_REQUEST_" + target.name(),
                "IpdAdmissionRequest", saved.getId(),
                Map.of("from", current.name(), "to", target.name()));

        return toResponse(principal.getTenantId(), saved, null, null);
    }

    private String allocateRequestNumber(UUID hospitalId) {
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return "IPD-REQ-" + year + "-" + suffix;
    }

    private IpdAdmissionRequestResponse toResponse(
            UUID tenantId,
            IpdAdmissionRequestEntity entity,
            PatientProfileEntity patientPrefetch,
            EncounterEntity encounterPrefetch) {
        PatientProfileEntity patient = patientPrefetch;
        if (patient == null) {
            patient = patientProfileRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(entity.getPatientId(), tenantId)
                    .orElse(null);
        }
        EncounterEntity encounter = encounterPrefetch;
        if (encounter == null && entity.getSourceEncounterId() != null) {
            encounter = encounterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(entity.getSourceEncounterId(), tenantId)
                    .orElse(null);
        }

        String patientName = null;
        String uhid = null;
        if (patient != null) {
            patientName = ((patient.getLegalFirstName() != null ? patient.getLegalFirstName() : "")
                    + " "
                    + (patient.getLegalLastName() != null ? patient.getLegalLastName() : "")).trim();
            if (patientName.isEmpty()) {
                patientName = null;
            }
            uhid = patient.getUhid();
        }

        return IpdAdmissionRequestResponse.builder()
                .admissionRequestId(entity.getId())
                .requestNumber(entity.getRequestNumber())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .patientId(entity.getPatientId())
                .patientName(patientName)
                .uhid(uhid)
                .sourceEncounterId(entity.getSourceEncounterId())
                .sourceEncounterNumber(encounter != null ? encounter.getEncounterNumber() : null)
                .referringDoctorId(entity.getReferringDoctorId())
                .attendingDoctorId(entity.getAttendingDoctorId())
                .departmentId(entity.getDepartmentId())
                .admissionSource(entity.getAdmissionSource())
                .admissionType(entity.getAdmissionType())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .reasonForAdmission(entity.getReasonForAdmission())
                .provisionalDiagnosis(entity.getProvisionalDiagnosis())
                .requestedCareLevel(entity.getRequestedCareLevel())
                .requestedRoomCategory(entity.getRequestedRoomCategory())
                .expectedLosDays(entity.getExpectedLosDays())
                .plannedProcedure(entity.getPlannedProcedure())
                .isolationRequired(entity.isIsolationRequired())
                .specialRequirements(entity.getSpecialRequirements())
                .notes(entity.getNotes())
                .requestedAdmitAt(entity.getRequestedAdmitAt())
                .scheduledAdmitAt(entity.getScheduledAdmitAt())
                .reviewedAt(entity.getReviewedAt())
                .reviewedBy(entity.getReviewedBy())
                .reviewNotes(entity.getReviewNotes())
                .rejectionReason(entity.getRejectionReason())
                .resultingAdmissionId(entity.getResultingAdmissionId())
                .reservedBedId(entity.getReservedBedId())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
