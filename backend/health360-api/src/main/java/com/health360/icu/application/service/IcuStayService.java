package com.health360.icu.application.service;

import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.request.UpdateEncounterStatusRequest;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.icu.domain.IcuStayStatus;
import com.health360.icu.domain.MonitoringRecordType;
import com.health360.icu.infrastructure.persistence.entity.*;
import com.health360.icu.infrastructure.persistence.repository.*;
import com.health360.icu.presentation.dto.request.CreateIcuMonitoringRecordRequest;
import com.health360.icu.presentation.dto.request.CreateIcuStayRequest;
import com.health360.icu.presentation.dto.request.DischargeIcuStayRequest;
import com.health360.icu.presentation.dto.response.IcuDischargeResponse;
import com.health360.icu.presentation.dto.response.IcuMonitoringRecordResponse;
import com.health360.icu.presentation.dto.response.IcuStayResponse;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IcuStayService {

    private final IcuStayRepository stayRepository;
    private final IcuBedAssignmentRepository bedAssignmentRepository;
    private final IcuMonitoringRecordRepository monitoringRecordRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterService encounterService;
    private final IcuFacilityService facilityService;
    private final IcuAccessService accessService;
    private final IcuMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public IcuStayResponse admitToIcu(UserPrincipal principal, CreateIcuStayRequest request) {
        accessService.assertCanManageStays(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        IcuBedEntity bed = facilityService.requireAvailableBed(principal.getTenantId(), request.getBedId());
        IcuUnitEntity unit = facilityService.requireUnit(principal.getTenantId(), bed.getUnitId());

        if (!unit.getHospitalId().equals(request.getHospitalId())
                || !unit.getBranchId().equals(request.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Bed does not belong to the specified hospital branch");
        }

        if (bedAssignmentRepository.existsByBedIdAndActiveTrueAndDeletedAtIsNull(bed.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "ICU bed is already assigned");
        }

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(request.getPatientId());
        encounterRequest.setHospitalId(request.getHospitalId());
        encounterRequest.setBranchId(request.getBranchId());
        encounterRequest.setPrimaryDoctorId(request.getPrimaryDoctorId());
        encounterRequest.setEncounterType("ICU");
        encounterRequest.setVisitReason(request.getAdmissionReason());

        EncounterResponse encounterResponse = encounterService.createEncounter(principal, encounterRequest);

        UpdateEncounterStatusRequest inProgress = new UpdateEncounterStatusRequest();
        inProgress.setStatus(EncounterStatus.IN_PROGRESS.name());
        encounterService.updateEncounterStatus(principal, encounterResponse.getEncounterId(), inProgress);

        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterResponse.getEncounterId());

        IcuStayEntity stay = new IcuStayEntity();
        stay.setTenantId(principal.getTenantId());
        stay.setEncounterId(encounter.getId());
        stay.setHospitalId(request.getHospitalId());
        stay.setBranchId(request.getBranchId());
        stay.setPatientId(request.getPatientId());
        stay.setPrimaryDoctorId(request.getPrimaryDoctorId() != null
                ? request.getPrimaryDoctorId() : encounter.getPrimaryDoctorId());
        stay.setIpdAdmissionId(request.getIpdAdmissionId());
        stay.setStayNumber(encounter.getEncounterNumber());
        stay.setAdmissionReason(trimToNull(request.getAdmissionReason()));
        stay.setStatus(IcuStayStatus.ACTIVE.name());
        stay.setAdmittedAt(Instant.now());
        stay.setCreatedBy(principal.getUserId());
        stay.setUpdatedBy(principal.getUserId());

        IcuStayEntity savedStay = stayRepository.save(stay);

        IcuBedAssignmentEntity assignment = new IcuBedAssignmentEntity();
        assignment.setTenantId(principal.getTenantId());
        assignment.setStayId(savedStay.getId());
        assignment.setBedId(bed.getId());
        assignment.setAssignedAt(Instant.now());
        assignment.setActive(true);
        assignment.setCreatedBy(principal.getUserId());
        assignment.setUpdatedBy(principal.getUserId());
        bedAssignmentRepository.save(assignment);

        facilityService.occupyBed(bed, principal.getUserId());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ICU_PATIENT_ADMITTED",
                "IcuStay", savedStay.getId(),
                Map.of("patientId", request.getPatientId().toString(), "bedId", bed.getId().toString()));

        return mapper.toStayResponse(savedStay, encounter, bed);
    }

    @Transactional(readOnly = true)
    public Page<IcuStayResponse> listStays(
            UserPrincipal principal,
            UUID hospitalId,
            UUID branchId,
            String status,
            Pageable pageable) {
        accessService.assertCanReadStays(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        Page<IcuStayEntity> page;
        if (status != null && !status.isBlank()) {
            page = stayRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByAdmittedAtDesc(
                    tenantId, hospitalId, branchId, status.trim().toUpperCase(), pageable);
        } else {
            page = stayRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByAdmittedAtDesc(
                    tenantId, hospitalId, branchId, pageable);
        }

        return page.map(stay -> {
            EncounterEntity encounter = requireEncounter(tenantId, stay.getEncounterId());
            IcuBedEntity bed = resolveActiveBed(tenantId, stay.getId());
            return mapper.toStayResponse(stay, encounter, bed);
        });
    }

    @Transactional(readOnly = true)
    public IcuStayResponse getStay(UserPrincipal principal, UUID stayId) {
        accessService.assertCanReadStays(principal);
        IcuStayEntity stay = requireStay(principal.getTenantId(), stayId);
        accessService.assertStayScope(principal, stay);
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), stay.getEncounterId());
        IcuBedEntity bed = resolveActiveBed(principal.getTenantId(), stay.getId());
        return mapper.toStayResponse(stay, encounter, bed);
    }

    @Transactional
    public IcuMonitoringRecordResponse addMonitoringRecord(
            UserPrincipal principal, UUID stayId, CreateIcuMonitoringRecordRequest request) {
        accessService.assertCanWriteMonitoring(principal);
        IcuStayEntity stay = requireStay(principal.getTenantId(), stayId);
        accessService.assertStayScope(principal, stay);

        if (!IcuStayStatus.ACTIVE.name().equals(stay.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Monitoring records can only be added for active ICU stays");
        }

        MonitoringRecordType recordType = parseRecordType(request.getRecordType());

        IcuMonitoringRecordEntity record = new IcuMonitoringRecordEntity();
        record.setTenantId(principal.getTenantId());
        record.setStayId(stayId);
        record.setEncounterId(stay.getEncounterId());
        record.setRecordType(recordType.name());
        record.setPayload(request.getPayload() != null ? request.getPayload() : new HashMap<>());
        record.setNotes(trimToNull(request.getNotes()));
        record.setRecordedAt(Instant.now());
        record.setRecordedBy(principal.getUserId());
        record.setCreatedBy(principal.getUserId());
        record.setUpdatedBy(principal.getUserId());

        IcuMonitoringRecordEntity saved = monitoringRecordRepository.save(record);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ICU_MONITORING_RECORDED",
                "IcuMonitoringRecord", saved.getId(),
                Map.of("stayId", stayId.toString(), "recordType", recordType.name()));

        return mapper.toMonitoringRecordResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IcuMonitoringRecordResponse> listMonitoringRecords(UserPrincipal principal, UUID stayId) {
        accessService.assertCanReadMonitoring(principal);
        IcuStayEntity stay = requireStay(principal.getTenantId(), stayId);
        accessService.assertStayScope(principal, stay);
        return monitoringRecordRepository
                .findByTenantIdAndStayIdAndDeletedAtIsNullOrderByRecordedAtDesc(
                        principal.getTenantId(), stayId)
                .stream()
                .map(mapper::toMonitoringRecordResponse)
                .toList();
    }

    @Transactional
    public IcuDischargeResponse dischargeFromIcu(
            UserPrincipal principal, UUID stayId, DischargeIcuStayRequest request) {
        accessService.assertCanManageStays(principal);
        UUID tenantId = principal.getTenantId();
        IcuStayEntity stay = requireStay(tenantId, stayId);
        accessService.assertStayScope(principal, stay);

        if (!IcuStayStatus.ACTIVE.name().equals(stay.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "ICU stay is not active");
        }

        IcuBedAssignmentEntity assignment = bedAssignmentRepository
                .findByStayIdAndActiveTrueAndDeletedAtIsNull(stayId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Active bed assignment not found"));

        IcuBedEntity bed = facilityService.requireBed(tenantId, assignment.getBedId());

        Instant now = Instant.now();
        assignment.setActive(false);
        assignment.setReleasedAt(now);
        assignment.setUpdatedBy(principal.getUserId());
        bedAssignmentRepository.save(assignment);
        facilityService.releaseBed(bed, principal.getUserId());

        stay.setStatus(IcuStayStatus.DISCHARGED.name());
        stay.setDischargedAt(now);
        stay.setUpdatedBy(principal.getUserId());
        stayRepository.save(stay);

        UpdateEncounterStatusRequest completed = new UpdateEncounterStatusRequest();
        completed.setStatus(EncounterStatus.COMPLETED.name());
        encounterService.updateEncounterStatus(principal, stay.getEncounterId(), completed);

        EncounterEntity encounter = requireEncounter(tenantId, stay.getEncounterId());

        auditLogService.record(tenantId, principal.getUserId(), "ICU_PATIENT_DISCHARGED",
                "IcuStay", stayId, Map.of());

        return mapper.toDischargeResponse(
                stay, encounter, request.getSummaryText().trim(), trimToNull(request.getFollowUpPlan()));
    }

    private IcuStayEntity requireStay(UUID tenantId, UUID stayId) {
        return stayRepository.findByIdAndTenantIdAndDeletedAtIsNull(stayId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "ICU stay not found"));
    }

    private EncounterEntity requireEncounter(UUID tenantId, UUID encounterId) {
        return encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
    }

    private IcuBedEntity resolveActiveBed(UUID tenantId, UUID stayId) {
        return bedAssignmentRepository.findByStayIdAndActiveTrueAndDeletedAtIsNull(stayId)
                .map(a -> facilityService.requireBed(tenantId, a.getBedId()))
                .orElse(null);
    }

    private MonitoringRecordType parseRecordType(String value) {
        try {
            return MonitoringRecordType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid monitoring record type: " + value);
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
