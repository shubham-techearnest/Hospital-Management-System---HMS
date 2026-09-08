package com.health360.ipd.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.icu.application.service.IcuStayService;
import com.health360.icu.domain.IcuStayStatus;
import com.health360.icu.infrastructure.persistence.entity.IcuStayEntity;
import com.health360.icu.infrastructure.persistence.repository.IcuStayRepository;
import com.health360.icu.presentation.dto.request.CreateIcuStayRequest;
import com.health360.icu.presentation.dto.response.IcuStayResponse;
import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdBedAssignmentEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdBedEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdBloodRequestEntity;
import com.health360.ipd.infrastructure.persistence.repository.IpdAdmissionRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdBedAssignmentRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdBloodRequestRepository;
import com.health360.ipd.presentation.dto.request.CreateBloodRequestPayload;
import com.health360.ipd.presentation.dto.request.EscalateToIcuRequest;
import com.health360.ipd.presentation.dto.request.StepDownFromIcuRequest;
import com.health360.ipd.presentation.dto.request.UpdateIpdIsolationRequest;
import com.health360.ipd.presentation.dto.response.IpdAdmissionResponse;
import com.health360.ipd.presentation.dto.response.IpdBloodRequestResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IpdCareTransitionService {

    private final IpdAdmissionRepository admissionRepository;
    private final IpdBedAssignmentRepository bedAssignmentRepository;
    private final IpdBloodRequestRepository bloodRequestRepository;
    private final IpdFacilityService facilityService;
    private final IpdAdmissionService admissionService;
    private final IcuStayService icuStayService;
    private final IcuStayRepository icuStayRepository;
    private final IpdAccessService accessService;
    private final AuditLogService auditLogService;

    @Transactional
    public IpdAdmissionResponse escalateToIcu(
            UserPrincipal principal, UUID admissionId, EscalateToIcuRequest request) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        accessService.assertIpdServiceEnabled(
                principal,
                admission.getHospitalId(),
                IpdServiceKeys.IPD_ICU_ESCALATION,
                "ICU escalation is disabled for this hospital");

        if (!"ADMITTED".equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only active admissions can escalate to ICU");
        }
        if (admission.getActiveIcuStayId() != null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Admission already has an active ICU stay");
        }

        CreateIcuStayRequest icuRequest = new CreateIcuStayRequest();
        icuRequest.setPatientId(admission.getPatientId());
        icuRequest.setHospitalId(admission.getHospitalId());
        icuRequest.setBranchId(admission.getBranchId());
        icuRequest.setBedId(request.getIcuBedId());
        icuRequest.setPrimaryDoctorId(request.getPrimaryDoctorId() != null
                ? request.getPrimaryDoctorId() : admission.getPrimaryDoctorId());
        icuRequest.setIpdAdmissionId(admission.getId());
        icuRequest.setAdmissionReason(request.getReason() != null
                ? request.getReason()
                : admission.getAdmissionReason());

        IcuStayResponse stay = icuStayService.admitToIcuFromIpdEscalation(principal, icuRequest);

        bedAssignmentRepository.findByAdmissionIdAndActiveTrueAndDeletedAtIsNull(admissionId)
                .ifPresent(assignment -> {
                    IpdBedEntity bed = facilityService.requireBed(principal.getTenantId(), assignment.getBedId());
                    assignment.setActive(false);
                    assignment.setReleasedAt(Instant.now());
                    assignment.setUpdatedBy(principal.getUserId());
                    bedAssignmentRepository.save(assignment);
                    facilityService.releaseBed(bed, principal.getUserId());
                });

        admission.setActiveIcuStayId(stay.getStayId());
        admission.setCareLevel("ICU");
        admission.setUpdatedBy(principal.getUserId());
        admission.touch();
        admissionRepository.save(admission);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_ESCALATED_TO_ICU",
                "IpdAdmission", admissionId,
                Map.of("icuStayId", stay.getStayId().toString()));

        return admissionService.getAdmission(principal, admissionId);
    }

    @Transactional
    public IpdAdmissionResponse stepDownFromIcu(
            UserPrincipal principal, UUID admissionId, StepDownFromIcuRequest request) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        accessService.assertIpdServiceEnabled(
                principal,
                admission.getHospitalId(),
                IpdServiceKeys.IPD_ICU_ESCALATION,
                "ICU escalation is disabled for this hospital");

        if (admission.getActiveIcuStayId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "No active ICU stay linked to this admission");
        }

        IcuStayEntity stay = icuStayRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(admission.getActiveIcuStayId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "ICU stay not found"));
        if (!IcuStayStatus.ACTIVE.name().equals(stay.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Linked ICU stay is not active");
        }

        IpdBedEntity wardBed = facilityService.requireAvailableBed(principal.getTenantId(), request.getWardBedId());
        var room = facilityService.requireRoom(principal.getTenantId(), wardBed.getRoomId());
        var ward = facilityService.requireWard(principal.getTenantId(), room.getWardId());
        if (!ward.getHospitalId().equals(admission.getHospitalId())
                || !ward.getBranchId().equals(admission.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Ward bed does not belong to this hospital branch");
        }

        icuStayService.transferOutOfIcuFromIpdStepDown(principal, stay.getId());

        IpdBedAssignmentEntity assignment = new IpdBedAssignmentEntity();
        assignment.setTenantId(principal.getTenantId());
        assignment.setAdmissionId(admission.getId());
        assignment.setBedId(wardBed.getId());
        assignment.setAssignedAt(Instant.now());
        assignment.setActive(true);
        assignment.setCreatedBy(principal.getUserId());
        assignment.setUpdatedBy(principal.getUserId());
        bedAssignmentRepository.save(assignment);
        facilityService.occupyBed(wardBed, principal.getUserId());

        admission.setActiveIcuStayId(null);
        admission.setCareLevel("WARD");
        admission.setUpdatedBy(principal.getUserId());
        admission.touch();
        admissionRepository.save(admission);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_STEPPED_DOWN_FROM_ICU",
                "IpdAdmission", admissionId,
                Map.of("wardBedId", wardBed.getId().toString(),
                        "reason", request.getReason() != null ? request.getReason() : ""));

        return admissionService.getAdmission(principal, admissionId);
    }

    @Transactional
    public IpdAdmissionResponse updateIsolation(
            UserPrincipal principal, UUID admissionId, UpdateIpdIsolationRequest request) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        accessService.assertIpdServiceEnabled(
                principal,
                admission.getHospitalId(),
                IpdServiceKeys.IPD_ISOLATION,
                "Isolation / infection control is disabled for this hospital");

        if (request.getIsolationRequired() != null) {
            admission.setIsolationRequired(request.getIsolationRequired());
        }
        if (request.getCareLevel() != null && !request.getCareLevel().isBlank()) {
            admission.setCareLevel(request.getCareLevel().trim().toUpperCase(Locale.ROOT));
        }
        admission.setUpdatedBy(principal.getUserId());
        admission.touch();
        admissionRepository.save(admission);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_ISOLATION_UPDATED",
                "IpdAdmission", admissionId,
                Map.of("isolationRequired", String.valueOf(admission.isIsolationRequired())));

        return admissionService.getAdmission(principal, admissionId);
    }

    @Transactional
    public IpdBloodRequestResponse createBloodRequest(
            UserPrincipal principal, UUID admissionId, CreateBloodRequestPayload request) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        accessService.assertIpdServiceEnabled(
                principal,
                admission.getHospitalId(),
                IpdServiceKeys.IPD_BLOOD_BANK,
                "Blood bank requests are disabled for this hospital");

        IpdBloodRequestEntity entity = new IpdBloodRequestEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(admission.getHospitalId());
        entity.setAdmissionId(admission.getId());
        entity.setEncounterId(admission.getEncounterId());
        entity.setPatientId(admission.getPatientId());
        entity.setProductType(request.getProductType().trim().toUpperCase(Locale.ROOT));
        entity.setUnits(request.getUnits() > 0 ? request.getUnits() : 1);
        entity.setUrgency(request.getUrgency() != null
                ? request.getUrgency().trim().toUpperCase(Locale.ROOT) : "ROUTINE");
        entity.setIndication(trimToNull(request.getIndication()));
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setStatus("REQUESTED");
        entity.setRequestedAt(Instant.now());
        entity.setRequestedBy(principal.getUserId());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        IpdBloodRequestEntity saved = bloodRequestRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_BLOOD_REQUEST_CREATED",
                "IpdBloodRequest", saved.getId(),
                Map.of("productType", saved.getProductType(), "units", String.valueOf(saved.getUnits())));
        return toBloodResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IpdBloodRequestResponse> listBloodRequests(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanReadAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        return bloodRequestRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), admissionId)
                .stream()
                .map(this::toBloodResponse)
                .toList();
    }

    private IpdAdmissionEntity requireAdmission(UUID tenantId, UUID admissionId) {
        return admissionRepository.findByIdAndTenantIdAndDeletedAtIsNull(admissionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Admission not found"));
    }

    private IpdBloodRequestResponse toBloodResponse(IpdBloodRequestEntity entity) {
        return IpdBloodRequestResponse.builder()
                .bloodRequestId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .encounterId(entity.getEncounterId())
                .productType(entity.getProductType())
                .units(entity.getUnits())
                .urgency(entity.getUrgency())
                .indication(entity.getIndication())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .requestedAt(entity.getRequestedAt())
                .requestedBy(entity.getRequestedBy())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
