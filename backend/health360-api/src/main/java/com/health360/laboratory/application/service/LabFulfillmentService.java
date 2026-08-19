package com.health360.laboratory.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.domain.ClinicalOrderStatus;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.laboratory.domain.LabOrderStatus;
import com.health360.laboratory.domain.LabResultStatus;
import com.health360.laboratory.infrastructure.persistence.entity.*;
import com.health360.laboratory.infrastructure.persistence.repository.*;
import com.health360.laboratory.presentation.dto.request.*;
import com.health360.laboratory.presentation.dto.response.*;
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
public class LabFulfillmentService {

    private final LabOrderRepository labOrderRepository;
    private final LabSampleRepository sampleRepository;
    private final LabResultRepository resultRepository;
    private final LabReportRepository reportRepository;
    private final LabTestRepository testRepository;
    private final LabTestParameterRepository parameterRepository;
    private final ClinicalOrderRepository clinicalOrderRepository;
    private final ClinicalOrderItemRepository clinicalOrderItemRepository;
    private final EncounterRepository encounterRepository;
    private final LabCatalogService catalogService;
    private final LabAccessService accessService;
    private final EncounterAccessService encounterAccessService;
    private final LabMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<LabWorklistItemResponse> listPendingWorklist(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadOrders(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        return labOrderRepository.findPendingLabItems(tenantId, hospitalId, branchId).stream()
                .map(item -> {
                    ClinicalOrderEntity order = clinicalOrderRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                            .orElseThrow();
                    EncounterEntity encounter = encounterRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(order.getEncounterId(), tenantId)
                            .orElseThrow();
                    return LabWorklistItemResponse.builder()
                            .clinicalOrderItemId(item.getId())
                            .clinicalOrderId(order.getId())
                            .encounterId(encounter.getId())
                            .patientId(encounter.getPatientId())
                            .orderNumber(order.getOrderNumber())
                            .itemName(item.getItemName())
                            .itemCode(item.getItemCode())
                            .labTestId(item.getItemReferenceId())
                            .orderedAt(order.getOrderedAt())
                            .build();
                })
                .toList();
    }

    @Transactional
    public LabOrderResponse createLabOrder(UserPrincipal principal, CreateLabOrderRequest request) {
        accessService.assertCanManageOrders(principal);
        UUID tenantId = principal.getTenantId();

        ClinicalOrderItemEntity item = clinicalOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getClinicalOrderItemId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical order item not found"));

        if (!ClinicalOrderStatus.ORDERED.name().equals(item.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order item is not in ORDERED status");
        }

        if (labOrderRepository.findByClinicalOrderItemIdAndDeletedAtIsNull(item.getId()).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Lab order already exists for this clinical order item");
        }

        ClinicalOrderEntity clinicalOrder = clinicalOrderRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical order not found"));

        if (!"LAB".equals(clinicalOrder.getOrderType())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order is not a LAB order");
        }

        if (item.getItemReferenceId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order item must reference a lab test");
        }

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrder.getEncounterId(), tenantId)
                .orElseThrow();

        accessService.assertHospitalScope(principal, encounter.getHospitalId());

        LabTestEntity test = catalogService.requireTest(tenantId, item.getItemReferenceId());

        LabOrderEntity labOrder = new LabOrderEntity();
        labOrder.setTenantId(tenantId);
        labOrder.setClinicalOrderItemId(item.getId());
        labOrder.setClinicalOrderId(clinicalOrder.getId());
        labOrder.setEncounterId(encounter.getId());
        labOrder.setPatientId(encounter.getPatientId());
        labOrder.setHospitalId(encounter.getHospitalId());
        labOrder.setBranchId(encounter.getBranchId());
        labOrder.setLabTestId(test.getId());
        labOrder.setStatus(LabOrderStatus.RECEIVED.name());
        labOrder.setReceivedAt(Instant.now());
        labOrder.setCreatedBy(principal.getUserId());
        labOrder.setUpdatedBy(principal.getUserId());

        LabOrderEntity saved = labOrderRepository.save(labOrder);

        item.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
        item.setUpdatedBy(principal.getUserId());
        clinicalOrderItemRepository.save(item);

        clinicalOrder.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
        clinicalOrder.setUpdatedBy(principal.getUserId());
        clinicalOrderRepository.save(clinicalOrder);

        auditLogService.record(tenantId, principal.getUserId(), "LAB_ORDER_CREATED",
                "LabOrder", saved.getId(), Map.of("clinicalOrderItemId", item.getId().toString()));

        return buildOrderResponse(tenantId, saved);
    }

    @Transactional(readOnly = true)
    public Page<LabOrderResponse> listLabOrders(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanReadOrders(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        Page<LabOrderEntity> page;
        if (status != null && !status.isBlank()) {
            page = labOrderRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
                    tenantId, hospitalId, branchId, status.trim().toUpperCase(), pageable);
        } else {
            page = labOrderRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
                    tenantId, hospitalId, branchId, pageable);
        }

        return page.map(order -> buildOrderResponse(tenantId, order));
    }

    @Transactional(readOnly = true)
    public LabOrderResponse getLabOrder(UserPrincipal principal, UUID labOrderId) {
        accessService.assertCanReadOrders(principal);
        LabOrderEntity order = requireLabOrder(principal.getTenantId(), labOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());
        return buildOrderResponse(principal.getTenantId(), order);
    }

    @Transactional
    public LabOrderResponse collectSample(
            UserPrincipal principal, UUID labOrderId, CollectLabSampleRequest request) {
        accessService.assertCanManageOrders(principal);
        UUID tenantId = principal.getTenantId();
        LabOrderEntity order = requireLabOrder(tenantId, labOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());

        assertStatus(order, LabOrderStatus.RECEIVED);

        if (sampleRepository.findByLabOrderIdAndDeletedAtIsNull(labOrderId).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Sample already collected");
        }

        LabSampleEntity sample = new LabSampleEntity();
        sample.setTenantId(tenantId);
        sample.setLabOrderId(labOrderId);
        sample.setSpecimenId(trimToNull(request.getSpecimenId()));
        sample.setCollectedAt(Instant.now());
        sample.setCollectedBy(principal.getUserId());
        sample.setNotes(trimToNull(request.getNotes()));
        sample.setCreatedBy(principal.getUserId());
        sample.setUpdatedBy(principal.getUserId());
        sampleRepository.save(sample);

        order.setStatus(LabOrderStatus.SAMPLE_COLLECTED.name());
        order.setUpdatedBy(principal.getUserId());
        labOrderRepository.save(order);

        return buildOrderResponse(tenantId, order);
    }

    @Transactional
    public LabOrderResponse enterResults(
            UserPrincipal principal, UUID labOrderId, EnterLabResultsRequest request) {
        accessService.assertCanWriteResults(principal);
        UUID tenantId = principal.getTenantId();
        LabOrderEntity order = requireLabOrder(tenantId, labOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());

        if (!LabOrderStatus.SAMPLE_COLLECTED.name().equals(order.getStatus())
                && !LabOrderStatus.RESULTS_DRAFT.name().equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Results can only be entered after sample collection");
        }

        for (EnterLabResultsRequest.ResultEntry entry : request.getResults()) {
            LabTestParameterEntity parameter = parameterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(entry.getParameterId(), tenantId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Parameter not found"));

            if (!parameter.getLabTestId().equals(order.getLabTestId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Parameter does not belong to this lab test");
            }

            LabResultEntity result = resultRepository.findByTenantIdAndLabOrderIdAndDeletedAtIsNullOrderByRecordedAtAsc(
                            tenantId, labOrderId).stream()
                    .filter(r -> r.getParameterId().equals(parameter.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        LabResultEntity created = new LabResultEntity();
                        created.setTenantId(tenantId);
                        created.setLabOrderId(labOrderId);
                        created.setParameterId(parameter.getId());
                        created.setCreatedBy(principal.getUserId());
                        return created;
                    });

            result.setValueText(entry.getValueText().trim());
            result.setValueNumeric(entry.getValueNumeric());
            result.setUnit(parameter.getUnit());
            result.setStatus(LabResultStatus.DRAFT.name());
            result.setRecordedAt(Instant.now());
            result.setRecordedBy(principal.getUserId());
            result.setUpdatedBy(principal.getUserId());
            resultRepository.save(result);
        }

        order.setStatus(LabOrderStatus.RESULTS_DRAFT.name());
        order.setUpdatedBy(principal.getUserId());
        labOrderRepository.save(order);

        return buildOrderResponse(tenantId, order);
    }

    @Transactional
    public LabOrderResponse verifyResults(UserPrincipal principal, UUID labOrderId) {
        accessService.assertCanVerifyResults(principal);
        UUID tenantId = principal.getTenantId();
        LabOrderEntity order = requireLabOrder(tenantId, labOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());

        assertStatus(order, LabOrderStatus.RESULTS_DRAFT);

        List<LabResultEntity> results = resultRepository
                .findByTenantIdAndLabOrderIdAndDeletedAtIsNullOrderByRecordedAtAsc(tenantId, labOrderId);

        if (results.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "No results to verify");
        }

        long expectedParams = parameterRepository
                .findByTenantIdAndLabTestIdAndDeletedAtIsNullOrderByNameAsc(tenantId, order.getLabTestId())
                .size();
        if (results.size() < expectedParams) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "All test parameters must have results before verification");
        }

        Instant now = Instant.now();
        for (LabResultEntity result : results) {
            result.setStatus(LabResultStatus.VERIFIED.name());
            result.setVerifiedAt(now);
            result.setVerifiedBy(principal.getUserId());
            result.setUpdatedBy(principal.getUserId());
            resultRepository.save(result);
        }

        order.setStatus(LabOrderStatus.VERIFIED.name());
        order.setUpdatedBy(principal.getUserId());
        labOrderRepository.save(order);

        auditLogService.record(tenantId, principal.getUserId(), "LAB_RESULTS_VERIFIED",
                "LabOrder", labOrderId, Map.of());

        return buildOrderResponse(tenantId, order);
    }

    @Transactional
    public LabReportResponse releaseReport(
            UserPrincipal principal, UUID labOrderId, ReleaseLabReportRequest request) {
        accessService.assertCanReleaseReports(principal);
        UUID tenantId = principal.getTenantId();
        LabOrderEntity order = requireLabOrder(tenantId, labOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());

        assertStatus(order, LabOrderStatus.VERIFIED);

        if (reportRepository.findByLabOrderIdAndDeletedAtIsNull(labOrderId).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Report already released");
        }

        if (resultRepository.countByLabOrderIdAndDeletedAtIsNullAndStatusNot(
                labOrderId, LabResultStatus.VERIFIED.name()) > 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "All results must be verified before release");
        }

        LabTestEntity test = catalogService.requireTest(tenantId, order.getLabTestId());
        List<LabResultResponse> resultResponses = loadResultResponses(tenantId, labOrderId);

        LabReportEntity report = new LabReportEntity();
        report.setTenantId(tenantId);
        report.setLabOrderId(labOrderId);
        report.setEncounterId(order.getEncounterId());
        report.setSummaryText(trimToNull(request.getSummaryText()));
        report.setReleasedAt(Instant.now());
        report.setReleasedBy(principal.getUserId());
        report.setCreatedBy(principal.getUserId());
        report.setUpdatedBy(principal.getUserId());
        LabReportEntity savedReport = reportRepository.save(report);

        order.setStatus(LabOrderStatus.RELEASED.name());
        order.setUpdatedBy(principal.getUserId());
        labOrderRepository.save(order);

        ClinicalOrderItemEntity item = clinicalOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(order.getClinicalOrderItemId(), tenantId)
                .orElseThrow();
        item.setStatus(ClinicalOrderStatus.COMPLETED.name());
        item.setUpdatedBy(principal.getUserId());
        clinicalOrderItemRepository.save(item);

        updateClinicalOrderCompletion(tenantId, order.getClinicalOrderId(), principal.getUserId());

        auditLogService.record(tenantId, principal.getUserId(), "LAB_REPORT_RELEASED",
                "LabReport", savedReport.getId(), Map.of("labOrderId", labOrderId.toString()));

        return mapper.toReportResponse(savedReport, test, resultResponses);
    }

    @Transactional(readOnly = true)
    public List<LabReportResponse> listReleasedReportsForEncounter(
            UserPrincipal principal, UUID encounterId) {
        UUID tenantId = principal.getTenantId();
        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
        encounterAccessService.assertCanReadEncounter(principal, encounter);

        return reportRepository.findByTenantIdAndEncounterIdAndDeletedAtIsNullOrderByReleasedAtDesc(
                        tenantId, encounterId)
                .stream()
                .map(report -> {
                    LabOrderEntity order = requireLabOrder(tenantId, report.getLabOrderId());
                    LabTestEntity test = catalogService.requireTest(tenantId, order.getLabTestId());
                    return mapper.toReportResponse(report, test, loadResultResponses(tenantId, order.getId()));
                })
                .toList();
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

    private LabOrderResponse buildOrderResponse(UUID tenantId, LabOrderEntity order) {
        LabTestEntity test = catalogService.requireTest(tenantId, order.getLabTestId());
        LabSampleEntity sample = sampleRepository.findByLabOrderIdAndDeletedAtIsNull(order.getId()).orElse(null);
        List<LabResultResponse> results = loadResultResponses(tenantId, order.getId());
        LabReportResponse report = reportRepository.findByLabOrderIdAndDeletedAtIsNull(order.getId())
                .map(r -> mapper.toReportResponse(r, test, results))
                .orElse(null);
        return mapper.toOrderResponse(order, test, sample, results, report);
    }

    private List<LabResultResponse> loadResultResponses(UUID tenantId, UUID labOrderId) {
        return resultRepository.findByTenantIdAndLabOrderIdAndDeletedAtIsNullOrderByRecordedAtAsc(tenantId, labOrderId)
                .stream()
                .map(result -> {
                    LabTestParameterEntity parameter = parameterRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(result.getParameterId(), tenantId)
                            .orElseThrow();
                    return mapper.toResultResponse(result, parameter);
                })
                .toList();
    }

    private LabOrderEntity requireLabOrder(UUID tenantId, UUID labOrderId) {
        return labOrderRepository.findByIdAndTenantIdAndDeletedAtIsNull(labOrderId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Lab order not found"));
    }

    private void assertStatus(LabOrderEntity order, LabOrderStatus expected) {
        if (!expected.name().equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Lab order must be in " + expected.name() + " status");
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
