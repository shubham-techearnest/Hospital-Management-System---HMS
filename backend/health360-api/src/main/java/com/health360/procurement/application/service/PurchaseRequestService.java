package com.health360.procurement.application.service;

import com.health360.automation.application.service.ApprovalService;
import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.config.security.UserPrincipal;
import com.health360.inventory.infrastructure.persistence.entity.InventoryItemEntity;
import com.health360.inventory.infrastructure.persistence.repository.InventoryItemRepository;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseRequestEntity;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseRequestLineEntity;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseRequestLineRepository;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseRequestRepository;
import com.health360.procurement.presentation.dto.request.CreatePurchaseRequestLinePayload;
import com.health360.procurement.presentation.dto.request.CreatePurchaseRequestPayload;
import com.health360.procurement.presentation.dto.request.ReviewPurchaseRequestPayload;
import com.health360.procurement.presentation.dto.response.PurchaseRequestLineResponse;
import com.health360.procurement.presentation.dto.response.PurchaseRequestResponse;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseRequestService {

    private final PurchaseRequestRepository requestRepository;
    private final PurchaseRequestLineRepository lineRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ProcurementAccessService accessService;
    private final ApprovalService approvalService;
    private final EventPublisher eventPublisher;
    private final TaskService taskService;
    private final AuditLogService auditLogService;

    @Transactional
    public PurchaseRequestResponse create(UserPrincipal principal, CreatePurchaseRequestPayload request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        PurchaseRequestEntity entity = new PurchaseRequestEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setRequestNumber(allocateNumber("PR"));
        entity.setStatus("DRAFT");
        entity.setTitle(request.getTitle().trim());
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setRequestedBy(principal.getUserId());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        List<PurchaseRequestLineEntity> lines = buildLines(principal, entity, request.getLines());
        BigDecimal total = lines.stream()
                .map(PurchaseRequestLineEntity::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        entity.setTotalAmount(total);

        PurchaseRequestEntity saved = requestRepository.save(entity);
        for (PurchaseRequestLineEntity line : lines) {
            line.setPurchaseRequestId(saved.getId());
            lineRepository.save(line);
        }

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PROCUREMENT_PR_CREATED",
                "PurchaseRequest", saved.getId(), Map.of("requestNumber", saved.getRequestNumber()));

        return toResponse(saved, lines);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseRequestResponse> list(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);

        Page<PurchaseRequestEntity> page = status != null && !status.isBlank()
                ? requestRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable)
                : requestRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);

        return page.map(entity -> toResponse(entity, lineRepository.findByPurchaseRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(entity.getId())));
    }

    @Transactional(readOnly = true)
    public PurchaseRequestResponse get(UserPrincipal principal, UUID requestId) {
        accessService.assertCanRead(principal);
        PurchaseRequestEntity entity = require(principal.getTenantId(), requestId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        return toResponse(entity, lineRepository.findByPurchaseRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(entity.getId()));
    }

    @Transactional
    public PurchaseRequestResponse submit(UserPrincipal principal, UUID requestId) {
        accessService.assertCanWrite(principal);
        PurchaseRequestEntity entity = require(principal.getTenantId(), requestId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());

        if (!"DRAFT".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only DRAFT purchase requests can be submitted");
        }

        entity.setStatus("SUBMITTED");
        entity.setSubmittedAt(Instant.now());
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        PurchaseRequestEntity saved = requestRepository.save(entity);

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestNumber", saved.getRequestNumber());
        payload.put("title", saved.getTitle());
        payload.put("totalAmount", saved.getTotalAmount());

        approvalService.create(
                principal.getTenantId(),
                saved.getHospitalId(),
                "PURCHASE_REQUEST",
                "PurchaseRequest",
                saved.getId(),
                principal.getUserId(),
                payload);

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.PURCHASE_REQUESTED)
                .userId(principal.getUserId())
                .entityType("PurchaseRequest")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("PROCUREMENT")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PROCUREMENT_PR_SUBMITTED",
                "PurchaseRequest", saved.getId(), Map.of("requestNumber", saved.getRequestNumber()));

        return toResponse(saved, lineRepository.findByPurchaseRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(saved.getId()));
    }

    @Transactional
    public PurchaseRequestResponse approve(
            UserPrincipal principal, UUID requestId, ReviewPurchaseRequestPayload payload) {
        return decide(principal, requestId, "APPROVED", payload);
    }

    @Transactional
    public PurchaseRequestResponse reject(
            UserPrincipal principal, UUID requestId, ReviewPurchaseRequestPayload payload) {
        return decide(principal, requestId, "REJECTED", payload);
    }

    private PurchaseRequestResponse decide(
            UserPrincipal principal,
            UUID requestId,
            String decision,
            ReviewPurchaseRequestPayload payload) {
        accessService.assertCanApprove(principal);
        PurchaseRequestEntity entity = require(principal.getTenantId(), requestId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());

        if (!"SUBMITTED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only SUBMITTED purchase requests can be decided");
        }

        entity.setStatus(decision);
        entity.setDecidedAt(Instant.now());
        entity.setDecidedBy(principal.getUserId());
        if (payload != null && payload.getNotes() != null && !payload.getNotes().isBlank()) {
            entity.setNotes(trimToNull(payload.getNotes()));
        }
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        PurchaseRequestEntity saved = requestRepository.save(entity);

        String note = payload != null ? payload.getNotes() : null;
        approvalService.syncPendingDecision(
                principal.getTenantId(),
                "PurchaseRequest",
                saved.getId(),
                decision,
                principal.getUserId(),
                note);
        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "PurchaseRequest",
                saved.getId(),
                TaskTypes.APPROVE_PURCHASE_REQUEST,
                principal.getUserId());

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "PROCUREMENT_PR_" + decision,
                "PurchaseRequest", saved.getId(), Map.of("requestNumber", saved.getRequestNumber()));

        return toResponse(saved, lineRepository.findByPurchaseRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(saved.getId()));
    }

    PurchaseRequestEntity require(UUID tenantId, UUID requestId) {
        return requestRepository.findByIdAndTenantIdAndDeletedAtIsNull(requestId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Purchase request not found"));
    }

    private List<PurchaseRequestLineEntity> buildLines(
            UserPrincipal principal,
            PurchaseRequestEntity header,
            List<CreatePurchaseRequestLinePayload> linePayloads) {
        List<PurchaseRequestLineEntity> lines = new ArrayList<>();
        for (CreatePurchaseRequestLinePayload payload : linePayloads) {
            UUID inventoryItemId = payload.getInventoryItemId();
            String itemCode = payload.getItemCode().trim().toUpperCase(Locale.ROOT);
            String itemName = payload.getItemName().trim();

            if (inventoryItemId != null) {
                InventoryItemEntity item = inventoryItemRepository
                        .findByIdAndTenantIdAndDeletedAtIsNull(inventoryItemId, principal.getTenantId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                                "Inventory item not found: " + inventoryItemId));
                if (!item.getHospitalId().equals(header.getHospitalId())
                        || !item.getBranchId().equals(header.getBranchId())) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                            "Inventory item hospital/branch mismatch");
                }
                itemCode = item.getCode();
                itemName = item.getName();
            }

            BigDecimal unitPrice = payload.getUnitPrice() != null ? payload.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(payload.getQuantity()));

            PurchaseRequestLineEntity line = new PurchaseRequestLineEntity();
            line.setTenantId(principal.getTenantId());
            line.setInventoryItemId(inventoryItemId);
            line.setItemCode(itemCode);
            line.setItemName(itemName);
            line.setQuantity(payload.getQuantity());
            line.setUnitOfMeasure(trimOrDefault(payload.getUnitOfMeasure(), "EACH").toUpperCase(Locale.ROOT));
            line.setUnitPrice(unitPrice);
            line.setLineTotal(lineTotal);
            line.setCreatedBy(principal.getUserId());
            line.setUpdatedBy(principal.getUserId());
            lines.add(line);
        }
        return lines;
    }

    private PurchaseRequestResponse toResponse(PurchaseRequestEntity entity, List<PurchaseRequestLineEntity> lines) {
        List<PurchaseRequestLineResponse> lineResponses = lines.stream()
                .map(line -> PurchaseRequestLineResponse.builder()
                        .id(line.getId())
                        .inventoryItemId(line.getInventoryItemId())
                        .itemCode(line.getItemCode())
                        .itemName(line.getItemName())
                        .quantity(line.getQuantity())
                        .unitOfMeasure(line.getUnitOfMeasure())
                        .unitPrice(line.getUnitPrice())
                        .lineTotal(line.getLineTotal())
                        .build())
                .toList();

        return PurchaseRequestResponse.builder()
                .id(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .requestNumber(entity.getRequestNumber())
                .status(entity.getStatus())
                .title(entity.getTitle())
                .notes(entity.getNotes())
                .totalAmount(entity.getTotalAmount())
                .requestedBy(entity.getRequestedBy())
                .submittedAt(entity.getSubmittedAt())
                .decidedAt(entity.getDecidedAt())
                .decidedBy(entity.getDecidedBy())
                .createdAt(entity.getCreatedAt())
                .lines(lineResponses)
                .build();
    }

    static String allocateNumber(String prefix) {
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return prefix + "-" + year + "-" + suffix;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String trimOrDefault(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value.trim();
    }
}
