package com.health360.radiology.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.domain.ClinicalOrderStatus;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.radiology.domain.ImagingOrderStatus;
import com.health360.radiology.domain.ImagingReportStatus;
import com.health360.radiology.infrastructure.persistence.entity.*;
import com.health360.radiology.infrastructure.persistence.repository.*;
import com.health360.radiology.presentation.dto.request.*;
import com.health360.radiology.presentation.dto.response.*;
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
public class RadiologyFulfillmentService {

    private final ImagingOrderRepository imagingOrderRepository;
    private final ImagingStudyRepository studyRepository;
    private final ImagingReportRepository reportRepository;
    private final ClinicalOrderRepository clinicalOrderRepository;
    private final ClinicalOrderItemRepository clinicalOrderItemRepository;
    private final EncounterRepository encounterRepository;
    private final RadiologyCatalogService catalogService;
    private final RadiologyAccessService accessService;
    private final EncounterAccessService encounterAccessService;
    private final RadiologyMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<ImagingWorklistItemResponse> listPendingWorklist(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadOrders(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        return imagingOrderRepository.findPendingImagingItems(tenantId, hospitalId, branchId).stream()
                .map(item -> {
                    ClinicalOrderEntity order = clinicalOrderRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                            .orElseThrow();
                    EncounterEntity encounter = encounterRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(order.getEncounterId(), tenantId)
                            .orElseThrow();
                    return ImagingWorklistItemResponse.builder()
                            .clinicalOrderItemId(item.getId())
                            .clinicalOrderId(order.getId())
                            .encounterId(encounter.getId())
                            .patientId(encounter.getPatientId())
                            .orderNumber(order.getOrderNumber())
                            .itemName(item.getItemName())
                            .itemCode(item.getItemCode())
                            .modalityId(item.getItemReferenceId())
                            .orderedAt(order.getOrderedAt())
                            .build();
                })
                .toList();
    }

    @Transactional
    public ImagingOrderResponse createImagingOrder(UserPrincipal principal, CreateImagingOrderRequest request) {
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

        if (imagingOrderRepository.findByClinicalOrderItemIdAndDeletedAtIsNull(item.getId()).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Imaging order already exists for this clinical order item");
        }

        ClinicalOrderEntity clinicalOrder = clinicalOrderRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical order not found"));

        if (!"IMAGING".equals(clinicalOrder.getOrderType())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order is not an IMAGING order");
        }

        if (item.getItemReferenceId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order item must reference an imaging modality");
        }

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrder.getEncounterId(), tenantId)
                .orElseThrow();

        accessService.assertHospitalScope(principal, encounter.getHospitalId());

        ImagingModalityEntity modality = catalogService.requireModality(tenantId, item.getItemReferenceId());

        ImagingOrderEntity order = new ImagingOrderEntity();
        order.setTenantId(tenantId);
        order.setClinicalOrderItemId(item.getId());
        order.setClinicalOrderId(clinicalOrder.getId());
        order.setEncounterId(encounter.getId());
        order.setPatientId(encounter.getPatientId());
        order.setHospitalId(encounter.getHospitalId());
        order.setBranchId(encounter.getBranchId());
        order.setModalityId(modality.getId());
        order.setStatus(ImagingOrderStatus.RECEIVED.name());
        order.setReceivedAt(Instant.now());
        order.setCreatedBy(principal.getUserId());
        order.setUpdatedBy(principal.getUserId());

        ImagingOrderEntity saved = imagingOrderRepository.save(order);

        item.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
        item.setUpdatedBy(principal.getUserId());
        clinicalOrderItemRepository.save(item);

        clinicalOrder.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
        clinicalOrder.setUpdatedBy(principal.getUserId());
        clinicalOrderRepository.save(clinicalOrder);

        auditLogService.record(tenantId, principal.getUserId(), "IMAGING_ORDER_CREATED",
                "ImagingOrder", saved.getId(), Map.of("clinicalOrderItemId", item.getId().toString()));

        return buildOrderResponse(tenantId, saved);
    }

    @Transactional(readOnly = true)
    public Page<ImagingOrderResponse> listImagingOrders(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanReadOrders(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        Page<ImagingOrderEntity> page;
        if (status != null && !status.isBlank()) {
            page = imagingOrderRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
                            tenantId, hospitalId, branchId, status.trim().toUpperCase(), pageable);
        } else {
            page = imagingOrderRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
                            tenantId, hospitalId, branchId, pageable);
        }
        return page.map(order -> buildOrderResponse(tenantId, order));
    }

    @Transactional(readOnly = true)
    public ImagingOrderResponse getImagingOrder(UserPrincipal principal, UUID imagingOrderId) {
        accessService.assertCanReadOrders(principal);
        ImagingOrderEntity order = requireImagingOrder(principal.getTenantId(), imagingOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());
        return buildOrderResponse(principal.getTenantId(), order);
    }

    @Transactional
    public ImagingOrderResponse scheduleStudy(
            UserPrincipal principal, UUID imagingOrderId, ScheduleImagingStudyRequest request) {
        accessService.assertCanManageOrders(principal);
        UUID tenantId = principal.getTenantId();
        ImagingOrderEntity order = requireImagingOrder(tenantId, imagingOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());
        assertStatus(order, ImagingOrderStatus.RECEIVED);

        ImagingStudyEntity study = studyRepository.findByImagingOrderIdAndDeletedAtIsNull(imagingOrderId)
                .orElseGet(() -> {
                    ImagingStudyEntity created = new ImagingStudyEntity();
                    created.setTenantId(tenantId);
                    created.setImagingOrderId(imagingOrderId);
                    created.setCreatedBy(principal.getUserId());
                    return created;
                });

        study.setScheduledAt(request.getScheduledAt() != null ? request.getScheduledAt() : Instant.now());
        study.setNotes(trimToNull(request.getNotes()));
        study.setUpdatedBy(principal.getUserId());
        studyRepository.save(study);

        order.setStatus(ImagingOrderStatus.SCHEDULED.name());
        order.setUpdatedBy(principal.getUserId());
        imagingOrderRepository.save(order);

        return buildOrderResponse(tenantId, order);
    }

    @Transactional
    public ImagingOrderResponse performStudy(
            UserPrincipal principal, UUID imagingOrderId, PerformImagingStudyRequest request) {
        accessService.assertCanManageOrders(principal);
        UUID tenantId = principal.getTenantId();
        ImagingOrderEntity order = requireImagingOrder(tenantId, imagingOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());
        assertStatus(order, ImagingOrderStatus.SCHEDULED);

        ImagingStudyEntity study = studyRepository.findByImagingOrderIdAndDeletedAtIsNull(imagingOrderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Study must be scheduled before performing"));

        study.setPerformedAt(Instant.now());
        study.setPerformedBy(principal.getUserId());
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            study.setNotes(request.getNotes().trim());
        }
        study.setUpdatedBy(principal.getUserId());
        studyRepository.save(study);

        order.setStatus(ImagingOrderStatus.PERFORMED.name());
        order.setUpdatedBy(principal.getUserId());
        imagingOrderRepository.save(order);

        return buildOrderResponse(tenantId, order);
    }

    @Transactional
    public ImagingOrderResponse enterReport(
            UserPrincipal principal, UUID imagingOrderId, EnterImagingReportRequest request) {
        accessService.assertCanWriteReports(principal);
        UUID tenantId = principal.getTenantId();
        ImagingOrderEntity order = requireImagingOrder(tenantId, imagingOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());

        if (!ImagingOrderStatus.PERFORMED.name().equals(order.getStatus())
                && !ImagingOrderStatus.REPORT_DRAFT.name().equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Report can only be entered after study is performed");
        }

        ImagingReportEntity report = reportRepository.findByImagingOrderIdAndDeletedAtIsNull(imagingOrderId)
                .orElseGet(() -> {
                    ImagingReportEntity created = new ImagingReportEntity();
                    created.setTenantId(tenantId);
                    created.setImagingOrderId(imagingOrderId);
                    created.setEncounterId(order.getEncounterId());
                    created.setCreatedBy(principal.getUserId());
                    return created;
                });

        report.setFindingsText(trimToNull(request.getFindingsText()));
        report.setImpressionText(trimToNull(request.getImpressionText()));
        report.setStatus(ImagingReportStatus.DRAFT.name());
        report.setUpdatedBy(principal.getUserId());
        reportRepository.save(report);

        order.setStatus(ImagingOrderStatus.REPORT_DRAFT.name());
        order.setUpdatedBy(principal.getUserId());
        imagingOrderRepository.save(order);

        return buildOrderResponse(tenantId, order);
    }

    @Transactional
    public ImagingOrderResponse verifyReport(UserPrincipal principal, UUID imagingOrderId) {
        accessService.assertCanVerifyReports(principal);
        UUID tenantId = principal.getTenantId();
        ImagingOrderEntity order = requireImagingOrder(tenantId, imagingOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());
        assertStatus(order, ImagingOrderStatus.REPORT_DRAFT);

        ImagingReportEntity report = reportRepository.findByImagingOrderIdAndDeletedAtIsNull(imagingOrderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "No report to verify"));

        if (isBlank(report.getFindingsText()) && isBlank(report.getImpressionText())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Report must have findings or impression before verification");
        }

        Instant now = Instant.now();
        report.setStatus(ImagingReportStatus.VERIFIED.name());
        report.setVerifiedAt(now);
        report.setVerifiedBy(principal.getUserId());
        report.setUpdatedBy(principal.getUserId());
        reportRepository.save(report);

        order.setStatus(ImagingOrderStatus.VERIFIED.name());
        order.setUpdatedBy(principal.getUserId());
        imagingOrderRepository.save(order);

        auditLogService.record(tenantId, principal.getUserId(), "IMAGING_REPORT_VERIFIED",
                "ImagingOrder", imagingOrderId, Map.of());

        return buildOrderResponse(tenantId, order);
    }

    @Transactional
    public ImagingReportResponse releaseReport(
            UserPrincipal principal, UUID imagingOrderId, ReleaseImagingReportRequest request) {
        accessService.assertCanReleaseReports(principal);
        UUID tenantId = principal.getTenantId();
        ImagingOrderEntity order = requireImagingOrder(tenantId, imagingOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());
        assertStatus(order, ImagingOrderStatus.VERIFIED);

        ImagingReportEntity report = reportRepository.findByImagingOrderIdAndDeletedAtIsNull(imagingOrderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "No report to release"));

        if (!ImagingReportStatus.VERIFIED.name().equals(report.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Report must be verified before release");
        }

        if (report.getReleasedAt() != null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Report already released");
        }

        Instant now = Instant.now();
        report.setReleasedAt(now);
        report.setReleasedBy(principal.getUserId());
        report.setUpdatedBy(principal.getUserId());
        if (request.getSummaryText() != null && !request.getSummaryText().isBlank()) {
            String summary = request.getSummaryText().trim();
            report.setImpressionText(
                    report.getImpressionText() != null
                            ? report.getImpressionText() + "\n\n" + summary
                            : summary);
        }
        reportRepository.save(report);

        order.setStatus(ImagingOrderStatus.RELEASED.name());
        order.setUpdatedBy(principal.getUserId());
        imagingOrderRepository.save(order);

        ClinicalOrderItemEntity item = clinicalOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(order.getClinicalOrderItemId(), tenantId)
                .orElseThrow();
        item.setStatus(ClinicalOrderStatus.COMPLETED.name());
        item.setUpdatedBy(principal.getUserId());
        clinicalOrderItemRepository.save(item);

        updateClinicalOrderCompletion(tenantId, order.getClinicalOrderId(), principal.getUserId());

        ImagingModalityEntity modality = catalogService.requireModality(tenantId, order.getModalityId());

        auditLogService.record(tenantId, principal.getUserId(), "IMAGING_REPORT_RELEASED",
                "ImagingReport", report.getId(), Map.of("imagingOrderId", imagingOrderId.toString()));

        return mapper.toReportResponse(report, modality);
    }

    @Transactional(readOnly = true)
    public List<ImagingReportResponse> listReleasedReportsForEncounter(
            UserPrincipal principal, UUID encounterId) {
        UUID tenantId = principal.getTenantId();
        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
        encounterAccessService.assertCanReadEncounter(principal, encounter);

        return reportRepository
                .findByTenantIdAndEncounterIdAndReleasedAtIsNotNullAndDeletedAtIsNullOrderByReleasedAtDesc(
                        tenantId, encounterId)
                .stream()
                .map(report -> {
                    ImagingOrderEntity order = requireImagingOrder(tenantId, report.getImagingOrderId());
                    ImagingModalityEntity modality = catalogService.requireModality(tenantId, order.getModalityId());
                    return mapper.toReportResponse(report, modality);
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

    private ImagingOrderResponse buildOrderResponse(UUID tenantId, ImagingOrderEntity order) {
        ImagingModalityEntity modality = catalogService.requireModality(tenantId, order.getModalityId());
        ImagingStudyEntity study = studyRepository.findByImagingOrderIdAndDeletedAtIsNull(order.getId()).orElse(null);
        ImagingReportEntity report = reportRepository.findByImagingOrderIdAndDeletedAtIsNull(order.getId()).orElse(null);
        return mapper.toOrderResponse(order, modality, study, report);
    }

    private ImagingOrderEntity requireImagingOrder(UUID tenantId, UUID imagingOrderId) {
        return imagingOrderRepository.findByIdAndTenantIdAndDeletedAtIsNull(imagingOrderId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Imaging order not found"));
    }

    private void assertStatus(ImagingOrderEntity order, ImagingOrderStatus expected) {
        if (!expected.name().equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Imaging order must be in " + expected.name() + " status");
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
