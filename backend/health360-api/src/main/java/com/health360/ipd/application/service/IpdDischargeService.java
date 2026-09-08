package com.health360.ipd.application.service;

import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.UpdateEncounterStatusRequest;
import com.health360.config.security.UserPrincipal;
import com.health360.ipd.domain.AdmissionStatus;
import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.infrastructure.persistence.entity.*;
import com.health360.ipd.infrastructure.persistence.repository.*;
import com.health360.ipd.presentation.dto.request.CreateDischargeOrderRequest;
import com.health360.ipd.presentation.dto.request.DischargeIpdPatientRequest;
import com.health360.ipd.presentation.dto.request.UpdateDischargeClearanceRequest;
import com.health360.ipd.presentation.dto.request.UpsertDischargePlanRequest;
import com.health360.ipd.presentation.dto.response.IpdDischargeClearanceResponse;
import com.health360.ipd.presentation.dto.response.IpdDischargeOrderResponse;
import com.health360.ipd.presentation.dto.response.IpdDischargePlanResponse;
import com.health360.ipd.presentation.dto.response.IpdDischargeResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IpdDischargeService {

    private static final Set<String> DISCHARGE_TYPES = Set.of(
            "ROUTINE", "LAMA", "DAMA", "DEATH", "TRANSFER_OUT", "ABSCONDED");
    private static final Set<String> CLEARANCE_TYPES = Set.of(
            "CLINICAL", "NURSING", "PHARMACY", "LAB", "BILLING", "PAYER");
    private static final Set<String> CLEARANCE_STATUSES = Set.of("PENDING", "CLEARED", "WAIVED", "BLOCKED");
    private static final Set<String> READINESS = Set.of("NOT_READY", "CONDITIONALLY_READY", "READY");
    private static final List<String> DEFAULT_CLEARANCES = List.of(
            "CLINICAL", "NURSING", "PHARMACY", "LAB", "BILLING", "PAYER");

    private final IpdAdmissionRepository admissionRepository;
    private final IpdBedAssignmentRepository bedAssignmentRepository;
    private final IpdDischargeSummaryRepository dischargeSummaryRepository;
    private final IpdDischargePlanRepository planRepository;
    private final IpdDischargeOrderRepository orderRepository;
    private final IpdDischargeClearanceRepository clearanceRepository;
    private final IpdDeathRecordRepository deathRecordRepository;
    private final IpdTransferOutRecordRepository transferOutRepository;
    private final IpdMedicationReconciliationRepository medReconRepository;
    private final IpdFinancialClearanceRepository financialClearanceRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterService encounterService;
    private final IpdFacilityService facilityService;
    private final IpdAccessService accessService;
    private final IpdBillingService billingService;
    private final IpdServiceCatalogService catalogService;
    private final IpdMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public IpdDischargePlanResponse upsertPlan(
            UserPrincipal principal, UUID admissionId, UpsertDischargePlanRequest request) {
        IpdAdmissionEntity admission = requireActiveAdmission(principal, admissionId, true);
        IpdDischargePlanEntity plan = planRepository.findByAdmissionIdAndDeletedAtIsNull(admissionId)
                .orElseGet(() -> {
                    IpdDischargePlanEntity created = new IpdDischargePlanEntity();
                    created.setTenantId(principal.getTenantId());
                    created.setHospitalId(admission.getHospitalId());
                    created.setAdmissionId(admission.getId());
                    created.setEncounterId(admission.getEncounterId());
                    created.setCreatedBy(principal.getUserId());
                    return created;
                });

        if (request.getExpectedDischargeAt() != null) {
            plan.setExpectedDischargeAt(request.getExpectedDischargeAt());
        }
        if (request.getReadiness() != null && !request.getReadiness().isBlank()) {
            String readiness = request.getReadiness().trim().toUpperCase(Locale.ROOT);
            if (!READINESS.contains(readiness)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid readiness");
            }
            plan.setReadiness(readiness);
        }
        if (request.getPendingResultsJson() != null) {
            plan.setPendingResultsJson(trimToNull(request.getPendingResultsJson()));
        }
        if (request.getBarriers() != null) {
            plan.setBarriers(trimToNull(request.getBarriers()));
        }
        if (request.getNotes() != null) {
            plan.setNotes(trimToNull(request.getNotes()));
        }
        plan.setUpdatedBy(principal.getUserId());
        plan.touch();
        return toPlanResponse(planRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public IpdDischargePlanResponse getPlan(UserPrincipal principal, UUID admissionId) {
        requireReadableAdmission(principal, admissionId);
        return planRepository.findByAdmissionIdAndDeletedAtIsNull(admissionId)
                .map(this::toPlanResponse)
                .orElse(IpdDischargePlanResponse.builder()
                        .admissionId(admissionId)
                        .readiness("NOT_READY")
                        .build());
    }

    @Transactional
    public IpdDischargeOrderResponse placeOrder(
            UserPrincipal principal, UUID admissionId, CreateDischargeOrderRequest request) {
        IpdAdmissionEntity admission = requireActiveAdmission(principal, admissionId, true);
        Map<String, Object> country = catalogService.resolveCountryConfig(
                admission.getHospitalId(), principal.getTenantId());

        if (boolFlag(country, "requireDischargeMedRecon", false)) {
            boolean recon = medReconRepository
                    .existsByTenantIdAndAdmissionIdAndReconTypeAndStatusAndDeletedAtIsNull(
                            principal.getTenantId(), admissionId, "DISCHARGE", "COMPLETED");
            if (!recon) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "Discharge medication reconciliation is required before ordering discharge");
            }
        }

        // Cancel prior active orders
        orderRepository.findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByOrderedAtDesc(
                        principal.getTenantId(), admissionId)
                .stream()
                .filter(o -> "ACTIVE".equals(o.getStatus()))
                .forEach(o -> {
                    o.setStatus("CANCELLED");
                    o.setUpdatedBy(principal.getUserId());
                    o.touch();
                    orderRepository.save(o);
                });

        IpdDischargeOrderEntity order = new IpdDischargeOrderEntity();
        order.setTenantId(principal.getTenantId());
        order.setHospitalId(admission.getHospitalId());
        order.setAdmissionId(admission.getId());
        order.setEncounterId(admission.getEncounterId());
        order.setOrderedAt(Instant.now());
        order.setOrderedBy(principal.getUserId());
        order.setNotes(trimToNull(request != null ? request.getNotes() : null));
        order.setStatus("ACTIVE");
        order.setCreatedBy(principal.getUserId());
        order.setUpdatedBy(principal.getUserId());
        IpdDischargeOrderEntity saved = orderRepository.save(order);

        ensureClearanceRows(principal, admission);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_DISCHARGE_ORDERED",
                "IpdDischargeOrder", saved.getId(), Map.of());
        return toOrderResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IpdDischargeOrderResponse> listOrders(UserPrincipal principal, UUID admissionId) {
        requireReadableAdmission(principal, admissionId);
        return orderRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByOrderedAtDesc(
                        principal.getTenantId(), admissionId)
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Transactional
    public List<IpdDischargeClearanceResponse> ensureAndListClearances(
            UserPrincipal principal, UUID admissionId) {
        IpdAdmissionEntity admission = requireReadableAdmission(principal, admissionId);
        if (AdmissionStatus.ADMITTED.name().equals(admission.getStatus())) {
            ensureClearanceRows(principal, admission);
            syncBillingClearance(principal, admission);
        }
        return clearanceRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByClearanceTypeAsc(
                        principal.getTenantId(), admissionId)
                .stream()
                .map(this::toClearanceResponse)
                .toList();
    }

    @Transactional
    public IpdDischargeClearanceResponse updateClearance(
            UserPrincipal principal, UUID admissionId, UpdateDischargeClearanceRequest request) {
        IpdAdmissionEntity admission = requireActiveAdmission(principal, admissionId, true);
        String type = request.getClearanceType().trim().toUpperCase(Locale.ROOT);
        String status = request.getStatus().trim().toUpperCase(Locale.ROOT);
        if (!CLEARANCE_TYPES.contains(type)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid clearance type");
        }
        if (!CLEARANCE_STATUSES.contains(status)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid clearance status");
        }

        ensureClearanceRows(principal, admission);
        IpdDischargeClearanceEntity entity = clearanceRepository
                .findByAdmissionIdAndClearanceTypeAndDeletedAtIsNull(admissionId, type)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clearance row not found"));

        entity.setStatus(status);
        entity.setNotes(trimToNull(request.getNotes()));
        if ("CLEARED".equals(status) || "WAIVED".equals(status)) {
            entity.setClearedAt(Instant.now());
            entity.setClearedBy(principal.getUserId());
        } else {
            entity.setClearedAt(null);
            entity.setClearedBy(null);
        }
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        return toClearanceResponse(clearanceRepository.save(entity));
    }

    @Transactional
    public IpdDischargeResponse completeDischarge(
            UserPrincipal principal, UUID admissionId, DischargeIpdPatientRequest request) {
        accessService.assertCanDischarge(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);

        if (!AdmissionStatus.ADMITTED.name().equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Admission is not active");
        }

        String dischargeType = request.getDischargeType() != null
                ? request.getDischargeType().trim().toUpperCase(Locale.ROOT) : "ROUTINE";
        if (!DISCHARGE_TYPES.contains(dischargeType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid discharge type");
        }

        gateSpecialTypes(principal, admission, dischargeType);
        Map<String, Object> country = catalogService.resolveCountryConfig(
                admission.getHospitalId(), principal.getTenantId());

        boolean lamaLike = "LAMA".equals(dischargeType) || "DAMA".equals(dischargeType) || "ABSCONDED".equals(dischargeType);
        if (!lamaLike && boolFlag(country, "requireDischargeMedRecon", false)) {
            boolean recon = medReconRepository
                    .existsByTenantIdAndAdmissionIdAndReconTypeAndStatusAndDeletedAtIsNull(
                            principal.getTenantId(), admissionId, "DISCHARGE", "COMPLETED");
            if (!recon) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "Discharge medication reconciliation is required");
            }
        }
        if (!lamaLike && boolFlag(country, "requireDischargeOrderBeforeComplete", false)) {
            if (!orderRepository.existsByTenantIdAndAdmissionIdAndStatusAndDeletedAtIsNull(
                    principal.getTenantId(), admissionId, "ACTIVE")) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "An active discharge order is required before completing discharge");
            }
        }
        if (!lamaLike && !"DEATH".equals(dischargeType)
                && boolFlag(country, "requireMultiDeptClearanceBeforeDischarge", false)) {
            assertAllClearancesDone(principal, admission);
        }

        billingService.assertReadyForDischarge(principal, admission);

        Instant now = Instant.now();
        bedAssignmentRepository.findByAdmissionIdAndActiveTrueAndDeletedAtIsNull(admissionId)
                .ifPresent(assignment -> {
                    IpdBedEntity bed = facilityService.requireBed(principal.getTenantId(), assignment.getBedId());
                    assignment.setActive(false);
                    assignment.setReleasedAt(now);
                    assignment.setUpdatedBy(principal.getUserId());
                    bedAssignmentRepository.save(assignment);
                    facilityService.releaseBed(bed, principal.getUserId());
                });

        int nextVersion = dischargeSummaryRepository.countByAdmissionIdAndDeletedAtIsNull(admissionId) + 1;
        IpdDischargeSummaryEntity summary = new IpdDischargeSummaryEntity();
        summary.setTenantId(principal.getTenantId());
        summary.setAdmissionId(admissionId);
        summary.setEncounterId(admission.getEncounterId());
        summary.setSummaryText(request.getSummaryText().trim());
        summary.setFollowUpPlan(trimToNull(request.getFollowUpPlan()));
        summary.setDischargedAt(now);
        summary.setDischargeType(dischargeType);
        summary.setVersionNo(nextVersion);
        summary.setSummaryStatus("FINAL");
        summary.setDiagnosisText(trimToNull(request.getDiagnosisText()));
        summary.setMedicationsText(trimToNull(request.getMedicationsText()));
        summary.setAdviceText(trimToNull(request.getAdviceText()));
        summary.setCreatedBy(principal.getUserId());
        summary.setUpdatedBy(principal.getUserId());
        IpdDischargeSummaryEntity savedSummary = dischargeSummaryRepository.save(summary);

        String admissionStatus = mapAdmissionStatus(dischargeType);
        admission.setStatus(admissionStatus);
        admission.setDischargedAt(now);
        admission.setUpdatedBy(principal.getUserId());
        admissionRepository.save(admission);

        if ("DEATH".equals(dischargeType)) {
            saveDeathRecord(principal, admission, request, now);
        }
        if ("TRANSFER_OUT".equals(dischargeType)) {
            saveTransferOut(principal, admission, request, now);
        }

        orderRepository.findFirstByTenantIdAndAdmissionIdAndStatusAndDeletedAtIsNullOrderByOrderedAtDesc(
                        principal.getTenantId(), admissionId, "ACTIVE")
                .ifPresent(order -> {
                    order.setStatus("COMPLETED");
                    order.setUpdatedBy(principal.getUserId());
                    order.touch();
                    orderRepository.save(order);
                });

        UpdateEncounterStatusRequest completed = new UpdateEncounterStatusRequest();
        completed.setStatus(EncounterStatus.COMPLETED.name());
        encounterService.updateEncounterStatus(principal, admission.getEncounterId(), completed);

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(admission.getEncounterId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_PATIENT_DISCHARGED",
                "IpdAdmission", admissionId, Map.of("dischargeType", dischargeType, "status", admissionStatus));

        return mapper.toDischargeResponse(savedSummary, admission, encounter);
    }

    @Transactional(readOnly = true)
    public IpdDischargeResponse getLatestSummary(UserPrincipal principal, UUID admissionId) {
        requireReadableAdmission(principal, admissionId);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        IpdDischargeSummaryEntity summary = dischargeSummaryRepository
                .findFirstByAdmissionIdAndDeletedAtIsNullOrderByVersionNoDesc(admissionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Discharge summary not found"));
        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(admission.getEncounterId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
        return mapper.toDischargeResponse(summary, admission, encounter);
    }

    private void gateSpecialTypes(UserPrincipal principal, IpdAdmissionEntity admission, String dischargeType) {
        if ("LAMA".equals(dischargeType) || "DAMA".equals(dischargeType) || "ABSCONDED".equals(dischargeType)) {
            accessService.assertIpdServiceEnabled(
                    principal, admission.getHospitalId(), IpdServiceKeys.IPD_LAMA_DAMA,
                    "LAMA / DAMA workflow is disabled for this hospital");
        }
        if ("DEATH".equals(dischargeType)) {
            accessService.assertIpdServiceEnabled(
                    principal, admission.getHospitalId(), IpdServiceKeys.IPD_DEATH_WORKFLOW,
                    "Death workflow is disabled for this hospital");
        }
    }

    private void saveDeathRecord(
            UserPrincipal principal, IpdAdmissionEntity admission, DischargeIpdPatientRequest request, Instant now) {
        if (request.getPronouncedAt() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "pronouncedAt is required for death discharge");
        }
        IpdDeathRecordEntity entity = deathRecordRepository.findByAdmissionIdAndDeletedAtIsNull(admission.getId())
                .orElseGet(IpdDeathRecordEntity::new);
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(admission.getHospitalId());
        entity.setAdmissionId(admission.getId());
        entity.setEncounterId(admission.getEncounterId());
        entity.setPronouncedAt(request.getPronouncedAt());
        entity.setCauseOfDeath(trimToNull(request.getCauseOfDeath()));
        entity.setCertifiedByName(trimToNull(request.getCertifiedByName()));
        entity.setCertifiedById(request.getCertifiedById());
        entity.setPlaceOfDeath(trimToNull(request.getPlaceOfDeath()));
        entity.setMortuaryNotes(trimToNull(request.getMortuaryNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        deathRecordRepository.save(entity);
    }

    private void saveTransferOut(
            UserPrincipal principal, IpdAdmissionEntity admission, DischargeIpdPatientRequest request, Instant now) {
        if (request.getDestinationName() == null || request.getDestinationName().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "destinationName is required for transfer-out");
        }
        IpdTransferOutRecordEntity entity = transferOutRepository
                .findByAdmissionIdAndDeletedAtIsNull(admission.getId())
                .orElseGet(IpdTransferOutRecordEntity::new);
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(admission.getHospitalId());
        entity.setAdmissionId(admission.getId());
        entity.setEncounterId(admission.getEncounterId());
        entity.setDestinationName(request.getDestinationName().trim());
        entity.setDestinationHospitalId(request.getDestinationHospitalId());
        entity.setReason(trimToNull(request.getTransferReason()));
        entity.setAcceptingPhysician(trimToNull(request.getAcceptingPhysician()));
        entity.setTransferredAt(now);
        entity.setTransportMode(trimToNull(request.getTransportMode()));
        entity.setNotes(trimToNull(request.getLeaveAgainstAdviceNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        transferOutRepository.save(entity);
    }

    private void ensureClearanceRows(UserPrincipal principal, IpdAdmissionEntity admission) {
        for (String type : DEFAULT_CLEARANCES) {
            if (clearanceRepository.findByAdmissionIdAndClearanceTypeAndDeletedAtIsNull(admission.getId(), type)
                    .isEmpty()) {
                IpdDischargeClearanceEntity row = new IpdDischargeClearanceEntity();
                row.setTenantId(principal.getTenantId());
                row.setHospitalId(admission.getHospitalId());
                row.setAdmissionId(admission.getId());
                row.setEncounterId(admission.getEncounterId());
                row.setClearanceType(type);
                row.setStatus("PENDING");
                row.setCreatedBy(principal.getUserId());
                row.setUpdatedBy(principal.getUserId());
                clearanceRepository.save(row);
            }
        }
    }

    private void syncBillingClearance(UserPrincipal principal, IpdAdmissionEntity admission) {
        financialClearanceRepository.findByAdmissionIdAndDeletedAtIsNull(admission.getId())
                .filter(fc -> "CLEARED".equals(fc.getStatus()))
                .ifPresent(fc -> clearanceRepository
                        .findByAdmissionIdAndClearanceTypeAndDeletedAtIsNull(admission.getId(), "BILLING")
                        .ifPresent(billing -> {
                            if (!"CLEARED".equals(billing.getStatus())) {
                                billing.setStatus("CLEARED");
                                billing.setClearedAt(fc.getClearedAt() != null ? fc.getClearedAt() : Instant.now());
                                billing.setClearedBy(fc.getClearedBy());
                                billing.setNotes("Synced from financial clearance");
                                billing.setUpdatedBy(principal.getUserId());
                                billing.touch();
                                clearanceRepository.save(billing);
                            }
                        }));
    }

    private void assertAllClearancesDone(UserPrincipal principal, IpdAdmissionEntity admission) {
        ensureClearanceRows(principal, admission);
        syncBillingClearance(principal, admission);
        List<String> pending = new ArrayList<>();
        for (IpdDischargeClearanceEntity row : clearanceRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByClearanceTypeAsc(
                        principal.getTenantId(), admission.getId())) {
            if (!"CLEARED".equals(row.getStatus()) && !"WAIVED".equals(row.getStatus())) {
                pending.add(row.getClearanceType());
            }
        }
        if (!pending.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Clearances still pending: " + String.join(", ", pending));
        }
    }

    private static String mapAdmissionStatus(String dischargeType) {
        return switch (dischargeType) {
            case "LAMA" -> AdmissionStatus.LAMA.name();
            case "DAMA" -> AdmissionStatus.DAMA.name();
            case "DEATH" -> AdmissionStatus.DECEASED.name();
            case "TRANSFER_OUT" -> AdmissionStatus.TRANSFERRED_OUT.name();
            case "ABSCONDED" -> AdmissionStatus.ABSCONDED.name();
            default -> AdmissionStatus.DISCHARGED.name();
        };
    }

    private IpdAdmissionEntity requireActiveAdmission(
            UserPrincipal principal, UUID admissionId, boolean write) {
        if (write) {
            accessService.assertCanManageAdmissions(principal);
        } else {
            accessService.assertCanReadAdmissions(principal);
        }
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        if (!AdmissionStatus.ADMITTED.name().equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Admission is not active");
        }
        return admission;
    }

    private IpdAdmissionEntity requireReadableAdmission(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanReadAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        return admission;
    }

    private IpdAdmissionEntity requireAdmission(UUID tenantId, UUID admissionId) {
        return admissionRepository.findByIdAndTenantIdAndDeletedAtIsNull(admissionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Admission not found"));
    }

    private static boolean boolFlag(Map<String, Object> cfg, String key, boolean defaultValue) {
        Object value = cfg.get(key);
        if (value instanceof Boolean b) return b;
        if (value instanceof String s) return Boolean.parseBoolean(s);
        return defaultValue;
    }

    private IpdDischargePlanResponse toPlanResponse(IpdDischargePlanEntity entity) {
        return IpdDischargePlanResponse.builder()
                .planId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .expectedDischargeAt(entity.getExpectedDischargeAt())
                .readiness(entity.getReadiness())
                .pendingResultsJson(entity.getPendingResultsJson())
                .barriers(entity.getBarriers())
                .notes(entity.getNotes())
                .build();
    }

    private IpdDischargeOrderResponse toOrderResponse(IpdDischargeOrderEntity entity) {
        return IpdDischargeOrderResponse.builder()
                .orderId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .orderedAt(entity.getOrderedAt())
                .orderedBy(entity.getOrderedBy())
                .notes(entity.getNotes())
                .status(entity.getStatus())
                .build();
    }

    private IpdDischargeClearanceResponse toClearanceResponse(IpdDischargeClearanceEntity entity) {
        return IpdDischargeClearanceResponse.builder()
                .clearanceId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .clearanceType(entity.getClearanceType())
                .status(entity.getStatus())
                .clearedAt(entity.getClearedAt())
                .clearedBy(entity.getClearedBy())
                .notes(entity.getNotes())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
