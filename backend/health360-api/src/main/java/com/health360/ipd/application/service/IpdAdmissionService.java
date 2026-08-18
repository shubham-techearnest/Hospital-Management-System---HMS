package com.health360.ipd.application.service;

import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.request.UpdateEncounterStatusRequest;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.ipd.domain.AdmissionStatus;
import com.health360.ipd.domain.RoundType;
import com.health360.ipd.infrastructure.persistence.entity.*;
import com.health360.ipd.infrastructure.persistence.repository.*;
import com.health360.ipd.presentation.dto.request.CreateIpdAdmissionRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdRoundRequest;
import com.health360.ipd.presentation.dto.request.DischargeIpdPatientRequest;
import com.health360.ipd.presentation.dto.response.IpdAdmissionResponse;
import com.health360.ipd.presentation.dto.response.IpdDischargeResponse;
import com.health360.ipd.presentation.dto.response.IpdRoundResponse;
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
public class IpdAdmissionService {

    private final IpdAdmissionRepository admissionRepository;
    private final IpdBedAssignmentRepository bedAssignmentRepository;
    private final IpdRoundRepository roundRepository;
    private final IpdDischargeSummaryRepository dischargeSummaryRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterService encounterService;
    private final IpdFacilityService facilityService;
    private final IpdAccessService accessService;
    private final IpdMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public IpdAdmissionResponse admitPatient(UserPrincipal principal, CreateIpdAdmissionRequest request) {
        accessService.assertCanManageAdmissions(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        IpdBedEntity bed = facilityService.requireAvailableBed(principal.getTenantId(), request.getBedId());
        IpdRoomEntity room = facilityService.requireRoom(principal.getTenantId(), bed.getRoomId());
        IpdWardEntity ward = facilityService.requireWard(principal.getTenantId(), room.getWardId());

        if (!ward.getHospitalId().equals(request.getHospitalId())
                || !ward.getBranchId().equals(request.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Bed does not belong to the specified hospital branch");
        }

        if (bedAssignmentRepository.existsByBedIdAndActiveTrueAndDeletedAtIsNull(bed.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Bed is already assigned");
        }

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(request.getPatientId());
        encounterRequest.setHospitalId(request.getHospitalId());
        encounterRequest.setBranchId(request.getBranchId());
        encounterRequest.setPrimaryDoctorId(request.getPrimaryDoctorId());
        encounterRequest.setEncounterType("IPD");
        encounterRequest.setVisitReason(request.getAdmissionReason());

        EncounterResponse encounterResponse = encounterService.createEncounter(principal, encounterRequest);

        UpdateEncounterStatusRequest inProgress = new UpdateEncounterStatusRequest();
        inProgress.setStatus(EncounterStatus.IN_PROGRESS.name());
        encounterService.updateEncounterStatus(principal, encounterResponse.getEncounterId(), inProgress);

        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterResponse.getEncounterId());

        IpdAdmissionEntity admission = new IpdAdmissionEntity();
        admission.setTenantId(principal.getTenantId());
        admission.setEncounterId(encounter.getId());
        admission.setHospitalId(request.getHospitalId());
        admission.setBranchId(request.getBranchId());
        admission.setPatientId(request.getPatientId());
        admission.setPrimaryDoctorId(request.getPrimaryDoctorId() != null
                ? request.getPrimaryDoctorId() : encounter.getPrimaryDoctorId());
        admission.setAdmissionNumber(encounter.getEncounterNumber());
        admission.setAdmissionReason(trimToNull(request.getAdmissionReason()));
        admission.setStatus(AdmissionStatus.ADMITTED.name());
        admission.setAdmittedAt(Instant.now());
        admission.setCreatedBy(principal.getUserId());
        admission.setUpdatedBy(principal.getUserId());

        IpdAdmissionEntity savedAdmission = admissionRepository.save(admission);

        IpdBedAssignmentEntity assignment = new IpdBedAssignmentEntity();
        assignment.setTenantId(principal.getTenantId());
        assignment.setAdmissionId(savedAdmission.getId());
        assignment.setBedId(bed.getId());
        assignment.setAssignedAt(Instant.now());
        assignment.setActive(true);
        assignment.setCreatedBy(principal.getUserId());
        assignment.setUpdatedBy(principal.getUserId());
        bedAssignmentRepository.save(assignment);

        facilityService.occupyBed(bed, principal.getUserId());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_PATIENT_ADMITTED",
                "IpdAdmission", savedAdmission.getId(),
                Map.of("patientId", request.getPatientId().toString(), "bedId", bed.getId().toString()));

        return mapper.toAdmissionResponse(savedAdmission, encounter, bed);
    }

    @Transactional(readOnly = true)
    public Page<IpdAdmissionResponse> listAdmissions(
            UserPrincipal principal,
            UUID hospitalId,
            UUID branchId,
            String status,
            Pageable pageable) {
        accessService.assertCanReadAdmissions(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        Page<IpdAdmissionEntity> page;
        if (status != null && !status.isBlank()) {
            page = admissionRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByAdmittedAtDesc(
                    tenantId, hospitalId, branchId, status.trim().toUpperCase(), pageable);
        } else {
            page = admissionRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByAdmittedAtDesc(
                    tenantId, hospitalId, branchId, pageable);
        }

        return page.map(admission -> {
            EncounterEntity encounter = requireEncounter(tenantId, admission.getEncounterId());
            IpdBedEntity bed = resolveActiveBed(tenantId, admission.getId());
            return mapper.toAdmissionResponse(admission, encounter, bed);
        });
    }

    @Transactional(readOnly = true)
    public IpdAdmissionResponse getAdmission(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanReadAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertAdmissionScope(principal, admission);
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), admission.getEncounterId());
        IpdBedEntity bed = resolveActiveBed(principal.getTenantId(), admission.getId());
        return mapper.toAdmissionResponse(admission, encounter, bed);
    }

    @Transactional
    public IpdRoundResponse addRound(
            UserPrincipal principal, UUID admissionId, CreateIpdRoundRequest request) {
        accessService.assertCanWriteRounds(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertAdmissionScope(principal, admission);

        if (!AdmissionStatus.ADMITTED.name().equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Rounds can only be recorded for active admissions");
        }

        RoundType roundType = parseRoundType(request.getRoundType());

        IpdRoundEntity round = new IpdRoundEntity();
        round.setTenantId(principal.getTenantId());
        round.setAdmissionId(admissionId);
        round.setEncounterId(admission.getEncounterId());
        round.setRoundType(roundType.name());
        round.setNotes(request.getNotes().trim());
        round.setRecordedAt(Instant.now());
        round.setRecordedBy(principal.getUserId());
        round.setCreatedBy(principal.getUserId());
        round.setUpdatedBy(principal.getUserId());

        return mapper.toRoundResponse(roundRepository.save(round));
    }

    @Transactional(readOnly = true)
    public List<IpdRoundResponse> listRounds(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanReadRounds(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertAdmissionScope(principal, admission);
        return roundRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByRecordedAtDesc(
                        principal.getTenantId(), admissionId)
                .stream()
                .map(mapper::toRoundResponse)
                .toList();
    }

    @Transactional
    public IpdDischargeResponse dischargePatient(
            UserPrincipal principal, UUID admissionId, DischargeIpdPatientRequest request) {
        accessService.assertCanDischarge(principal);
        UUID tenantId = principal.getTenantId();
        IpdAdmissionEntity admission = requireAdmission(tenantId, admissionId);
        accessService.assertAdmissionScope(principal, admission);

        if (!AdmissionStatus.ADMITTED.name().equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Admission is not active");
        }

        if (dischargeSummaryRepository.findByAdmissionIdAndDeletedAtIsNull(admissionId).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Patient already discharged");
        }

        IpdBedAssignmentEntity assignment = bedAssignmentRepository
                .findByAdmissionIdAndActiveTrueAndDeletedAtIsNull(admissionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Active bed assignment not found"));

        IpdBedEntity bed = facilityService.requireBed(tenantId, assignment.getBedId());

        Instant now = Instant.now();
        assignment.setActive(false);
        assignment.setReleasedAt(now);
        assignment.setUpdatedBy(principal.getUserId());
        bedAssignmentRepository.save(assignment);
        facilityService.releaseBed(bed, principal.getUserId());

        IpdDischargeSummaryEntity summary = new IpdDischargeSummaryEntity();
        summary.setTenantId(tenantId);
        summary.setAdmissionId(admissionId);
        summary.setEncounterId(admission.getEncounterId());
        summary.setSummaryText(request.getSummaryText().trim());
        summary.setFollowUpPlan(trimToNull(request.getFollowUpPlan()));
        summary.setDischargedAt(now);
        summary.setCreatedBy(principal.getUserId());
        summary.setUpdatedBy(principal.getUserId());
        IpdDischargeSummaryEntity savedSummary = dischargeSummaryRepository.save(summary);

        admission.setStatus(AdmissionStatus.DISCHARGED.name());
        admission.setDischargedAt(now);
        admission.setUpdatedBy(principal.getUserId());
        admissionRepository.save(admission);

        UpdateEncounterStatusRequest completed = new UpdateEncounterStatusRequest();
        completed.setStatus(EncounterStatus.COMPLETED.name());
        encounterService.updateEncounterStatus(principal, admission.getEncounterId(), completed);

        EncounterEntity encounter = requireEncounter(tenantId, admission.getEncounterId());

        auditLogService.record(tenantId, principal.getUserId(), "IPD_PATIENT_DISCHARGED",
                "IpdAdmission", admissionId, Map.of());

        return mapper.toDischargeResponse(savedSummary, admission, encounter);
    }

    private IpdAdmissionEntity requireAdmission(UUID tenantId, UUID admissionId) {
        return admissionRepository.findByIdAndTenantIdAndDeletedAtIsNull(admissionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Admission not found"));
    }

    private EncounterEntity requireEncounter(UUID tenantId, UUID encounterId) {
        return encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
    }

    private IpdBedEntity resolveActiveBed(UUID tenantId, UUID admissionId) {
        return bedAssignmentRepository.findByAdmissionIdAndActiveTrueAndDeletedAtIsNull(admissionId)
                .map(a -> facilityService.requireBed(tenantId, a.getBedId()))
                .orElse(null);
    }

    private RoundType parseRoundType(String value) {
        try {
            return RoundType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid round type: " + value);
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
