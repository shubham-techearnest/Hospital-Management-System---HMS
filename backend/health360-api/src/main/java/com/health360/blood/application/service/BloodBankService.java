package com.health360.blood.application.service;

import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.blood.infrastructure.persistence.entity.BloodRequestEntity;
import com.health360.blood.infrastructure.persistence.entity.BloodUnitEntity;
import com.health360.blood.infrastructure.persistence.repository.BloodRequestRepository;
import com.health360.blood.infrastructure.persistence.repository.BloodUnitRepository;
import com.health360.blood.presentation.dto.request.CompleteBloodRequestRequest;
import com.health360.blood.presentation.dto.request.CreateBloodRequestRequest;
import com.health360.blood.presentation.dto.request.DecideBloodRequestRequest;
import com.health360.blood.presentation.dto.request.IssueBloodRequestRequest;
import com.health360.blood.presentation.dto.request.ReceiveBloodUnitRequest;
import com.health360.blood.presentation.dto.response.BloodRequestResponse;
import com.health360.blood.presentation.dto.response.BloodUnitResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.tasks.application.service.TaskService;
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
public class BloodBankService {

    private static final Set<String> PRODUCT_TYPES = Set.of("PRBC", "FFP", "PLATELETS", "CRYO", "WHOLE_BLOOD");
    private static final Set<String> BLOOD_GROUPS = Set.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");
    private static final Set<String> URGENCIES = Set.of("ROUTINE", "URGENT", "STAT");

    private final BloodUnitRepository unitRepository;
    private final BloodRequestRepository requestRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final BloodAccessService accessService;
    private final EventPublisher eventPublisher;
    private final TaskService taskService;
    private final AuditLogService auditLogService;

    @Transactional
    public BloodUnitResponse receiveUnit(UserPrincipal principal, ReceiveBloodUnitRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        String unitNumber = request.getUnitNumber().trim().toUpperCase(Locale.ROOT);
        if (unitRepository.existsByHospitalIdAndUnitNumberAndDeletedAtIsNull(request.getHospitalId(), unitNumber)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT, "Unit number already exists");
        }
        String productType = normalize(request.getProductType(), "PRBC", PRODUCT_TYPES, "Invalid product type");
        String bloodGroup = normalizeGroup(request.getBloodGroup());

        BloodUnitEntity entity = new BloodUnitEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setUnitNumber(unitNumber);
        entity.setProductType(productType);
        entity.setBloodGroup(bloodGroup);
        entity.setStatus("AVAILABLE");
        entity.setCollectedAt(request.getCollectedAt());
        entity.setExpiresAt(request.getExpiresAt());
        entity.setDonorRef(trimToNull(request.getDonorRef()));
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        BloodUnitEntity saved = unitRepository.save(entity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "BLOOD_UNIT_RECEIVED",
                "BloodUnit", saved.getId(), Map.of("unitNumber", saved.getUnitNumber()));
        return toUnitResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<BloodUnitResponse> listUnits(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<BloodUnitEntity> page = status != null && !status.isBlank()
                ? unitRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable)
                : unitRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(this::toUnitResponse);
    }

    @Transactional
    public BloodRequestResponse createRequest(UserPrincipal principal, CreateBloodRequestRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getPatientId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient not found"));

        String productType = normalize(request.getProductType(), "PRBC", PRODUCT_TYPES, "Invalid product type");
        String bloodGroup = normalizeGroup(request.getBloodGroup());
        String urgency = normalize(request.getUrgency(), "ROUTINE", URGENCIES, "Invalid urgency");
        int units = request.getUnitsRequested() != null ? request.getUnitsRequested() : 1;

        BloodRequestEntity entity = new BloodRequestEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setRequestNumber(allocateNumber("BRQ"));
        entity.setPatientId(request.getPatientId());
        entity.setEncounterId(request.getEncounterId());
        entity.setAdmissionId(request.getAdmissionId());
        entity.setIpdBloodRequestId(request.getIpdBloodRequestId());
        entity.setProductType(productType);
        entity.setBloodGroup(bloodGroup);
        entity.setUnitsRequested(units);
        entity.setUrgency(urgency);
        entity.setStatus("REQUESTED");
        entity.setIndication(trimToNull(request.getIndication()));
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setRequestedAt(Instant.now());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        BloodRequestEntity saved = requestRepository.save(entity);

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestNumber", saved.getRequestNumber());
        payload.put("productType", saved.getProductType());
        payload.put("bloodGroup", saved.getBloodGroup());
        payload.put("unitsRequested", saved.getUnitsRequested());
        payload.put("urgency", saved.getUrgency());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .eventType(HospitalEventTypes.BLOOD_REQUESTED)
                .entityType("BloodRequest")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("BLOOD")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "BLOOD_REQUEST_CREATED",
                "BloodRequest", saved.getId(), Map.of("requestNumber", saved.getRequestNumber()));
        return toRequestResponse(saved, null);
    }

    @Transactional
    public BloodRequestResponse decideRequest(
            UserPrincipal principal, UUID requestId, DecideBloodRequestRequest request) {
        accessService.assertCanIssue(principal);
        BloodRequestEntity entity = requireRequest(principal.getTenantId(), requestId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"REQUESTED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only REQUESTED requests can be decided");
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
        BloodRequestEntity saved = requestRepository.save(entity);

        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "BloodRequest",
                saved.getId(),
                TaskTypes.REVIEW_BLOOD_REQUEST,
                principal.getUserId());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "BLOOD_REQUEST_DECIDED",
                "BloodRequest", saved.getId(), Map.of("decision", decision));
        return toRequestResponse(saved, null);
    }

    @Transactional
    public BloodRequestResponse issueRequest(
            UserPrincipal principal, UUID requestId, IssueBloodRequestRequest request) {
        accessService.assertCanIssue(principal);
        BloodRequestEntity entity = requireRequest(principal.getTenantId(), requestId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"APPROVED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only APPROVED requests can be issued");
        }

        BloodUnitEntity unit = resolveUnitForIssue(principal, entity, request != null ? request.getUnitId() : null);
        if (!"AVAILABLE".equals(unit.getStatus()) && !"RETURNED".equals(unit.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Unit is not available for issue");
        }
        if (!unit.getProductType().equals(entity.getProductType())
                || !unit.getBloodGroup().equals(entity.getBloodGroup())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Unit product/group does not match request");
        }
        if (!unit.getHospitalId().equals(entity.getHospitalId())
                || !unit.getBranchId().equals(entity.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Unit hospital/branch mismatch");
        }

        unit.setStatus("ISSUED");
        unit.setUpdatedBy(principal.getUserId());
        unitRepository.save(unit);

        entity.setStatus("ISSUED");
        entity.setUnitId(unit.getId());
        entity.setIssuedAt(Instant.now());
        entity.setIssuedBy(principal.getUserId());
        if (request != null && trimToNull(request.getNotes()) != null) {
            entity.setNotes(trimToNull(request.getNotes()));
        }
        entity.setUpdatedBy(principal.getUserId());
        BloodRequestEntity saved = requestRepository.save(entity);

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestNumber", saved.getRequestNumber());
        payload.put("unitNumber", unit.getUnitNumber());
        payload.put("productType", saved.getProductType());
        payload.put("bloodGroup", saved.getBloodGroup());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .eventType(HospitalEventTypes.BLOOD_ISSUED)
                .entityType("BloodRequest")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("BLOOD")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "BLOOD_UNIT_ISSUED",
                "BloodRequest", saved.getId(), Map.of("unitNumber", unit.getUnitNumber()));
        return toRequestResponse(saved, unit);
    }

    @Transactional
    public BloodRequestResponse returnIssued(
            UserPrincipal principal, UUID requestId, CompleteBloodRequestRequest request) {
        accessService.assertCanIssue(principal);
        BloodRequestEntity entity = requireRequest(principal.getTenantId(), requestId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"ISSUED".equals(entity.getStatus()) || entity.getUnitId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only ISSUED requests with a unit can be returned");
        }

        BloodUnitEntity unit = requireUnit(principal.getTenantId(), entity.getUnitId());
        unit.setStatus("AVAILABLE");
        unit.setUpdatedBy(principal.getUserId());
        unitRepository.save(unit);

        entity.setStatus("RETURNED");
        entity.setCompletedAt(Instant.now());
        if (request != null && trimToNull(request.getNotes()) != null) {
            entity.setNotes(trimToNull(request.getNotes()));
        }
        entity.setUpdatedBy(principal.getUserId());
        BloodRequestEntity saved = requestRepository.save(entity);

        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "BloodRequest",
                saved.getId(),
                TaskTypes.ISSUE_BLOOD_UNIT,
                principal.getUserId());

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestNumber", saved.getRequestNumber());
        payload.put("unitNumber", unit.getUnitNumber());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .eventType(HospitalEventTypes.BLOOD_RETURNED)
                .entityType("BloodRequest")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("BLOOD")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "BLOOD_UNIT_RETURNED",
                "BloodRequest", saved.getId(), Map.of("unitNumber", unit.getUnitNumber()));
        return toRequestResponse(saved, unit);
    }

    @Transactional
    public BloodRequestResponse completeRequest(
            UserPrincipal principal, UUID requestId, CompleteBloodRequestRequest request) {
        accessService.assertCanIssue(principal);
        BloodRequestEntity entity = requireRequest(principal.getTenantId(), requestId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"ISSUED".equals(entity.getStatus()) || entity.getUnitId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only ISSUED requests can be completed");
        }

        BloodUnitEntity unit = requireUnit(principal.getTenantId(), entity.getUnitId());
        unit.setStatus("TRANSFUSED");
        unit.setUpdatedBy(principal.getUserId());
        unitRepository.save(unit);

        entity.setStatus("COMPLETED");
        entity.setCompletedAt(Instant.now());
        if (request != null && trimToNull(request.getNotes()) != null) {
            entity.setNotes(trimToNull(request.getNotes()));
        }
        entity.setUpdatedBy(principal.getUserId());
        BloodRequestEntity saved = requestRepository.save(entity);

        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "BloodRequest",
                saved.getId(),
                TaskTypes.ISSUE_BLOOD_UNIT,
                principal.getUserId());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "BLOOD_TRANSFUSION_COMPLETED",
                "BloodRequest", saved.getId(), Map.of("unitNumber", unit.getUnitNumber()));
        return toRequestResponse(saved, unit);
    }

    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> listRequests(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<BloodRequestEntity> page = status != null && !status.isBlank()
                ? requestRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable)
                : requestRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(r -> toRequestResponse(r,
                r.getUnitId() != null ? unitRepository.findById(r.getUnitId()).orElse(null) : null));
    }

    private BloodUnitEntity resolveUnitForIssue(UserPrincipal principal, BloodRequestEntity request, UUID unitId) {
        if (unitId != null) {
            return requireUnit(principal.getTenantId(), unitId);
        }
        List<BloodUnitEntity> candidates = unitRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndProductTypeAndBloodGroupAndStatusAndDeletedAtIsNullOrderByExpiresAtAsc(
                        principal.getTenantId(),
                        request.getHospitalId(),
                        request.getBranchId(),
                        request.getProductType(),
                        request.getBloodGroup(),
                        "AVAILABLE");
        if (candidates.isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "No AVAILABLE unit matching product and blood group");
        }
        return candidates.getFirst();
    }

    private BloodRequestEntity requireRequest(UUID tenantId, UUID requestId) {
        return requestRepository.findByIdAndTenantIdAndDeletedAtIsNull(requestId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Blood request not found"));
    }

    private BloodUnitEntity requireUnit(UUID tenantId, UUID unitId) {
        return unitRepository.findByIdAndTenantIdAndDeletedAtIsNull(unitId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Blood unit not found"));
    }

    private BloodUnitResponse toUnitResponse(BloodUnitEntity e) {
        return BloodUnitResponse.builder()
                .unitId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .unitNumber(e.getUnitNumber())
                .productType(e.getProductType())
                .bloodGroup(e.getBloodGroup())
                .status(e.getStatus())
                .collectedAt(e.getCollectedAt())
                .expiresAt(e.getExpiresAt())
                .donorRef(e.getDonorRef())
                .notes(e.getNotes())
                .build();
    }

    private BloodRequestResponse toRequestResponse(BloodRequestEntity e, BloodUnitEntity unit) {
        return BloodRequestResponse.builder()
                .requestId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .requestNumber(e.getRequestNumber())
                .patientId(e.getPatientId())
                .encounterId(e.getEncounterId())
                .admissionId(e.getAdmissionId())
                .ipdBloodRequestId(e.getIpdBloodRequestId())
                .productType(e.getProductType())
                .bloodGroup(e.getBloodGroup())
                .unitsRequested(e.getUnitsRequested())
                .urgency(e.getUrgency())
                .status(e.getStatus())
                .indication(e.getIndication())
                .notes(e.getNotes())
                .decisionNotes(e.getDecisionNotes())
                .unitId(e.getUnitId())
                .unitNumber(unit != null ? unit.getUnitNumber() : null)
                .requestedAt(e.getRequestedAt())
                .decidedAt(e.getDecidedAt())
                .issuedAt(e.getIssuedAt())
                .completedAt(e.getCompletedAt())
                .build();
    }

    private static String allocateNumber(String prefix) {
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return prefix + "-" + year + "-" + suffix;
    }

    private static String normalizeGroup(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Blood group required");
        }
        String value = raw.trim().toUpperCase(Locale.ROOT);
        if (!BLOOD_GROUPS.contains(value)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid blood group");
        }
        return value;
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
