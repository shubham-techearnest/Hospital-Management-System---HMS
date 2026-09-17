package com.health360.procurement.application.service;

import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.config.security.UserPrincipal;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseOrderEntity;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseOrderLineEntity;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseRequestEntity;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseRequestLineEntity;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseOrderLineRepository;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseOrderRepository;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseRequestLineRepository;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseRequestRepository;
import com.health360.procurement.presentation.dto.request.CreatePurchaseOrderPayload;
import com.health360.procurement.presentation.dto.response.PurchaseOrderLineResponse;
import com.health360.procurement.presentation.dto.response.PurchaseOrderResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository orderRepository;
    private final PurchaseOrderLineRepository orderLineRepository;
    private final PurchaseRequestService purchaseRequestService;
    private final PurchaseRequestRepository requestRepository;
    private final PurchaseRequestLineRepository requestLineRepository;
    private final ProcurementAccessService accessService;
    private final EventPublisher eventPublisher;
    private final AuditLogService auditLogService;

    @Transactional
    public PurchaseOrderResponse createFromRequest(UserPrincipal principal, CreatePurchaseOrderPayload request) {
        accessService.assertCanWrite(principal);
        PurchaseRequestEntity pr = purchaseRequestService.require(principal.getTenantId(), request.getPurchaseRequestId());
        accessService.assertModuleEnabled(principal, pr.getHospitalId(), pr.getBranchId());

        if (!"APPROVED".equals(pr.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Purchase order can only be created from APPROVED purchase requests");
        }
        if (orderRepository.findByPurchaseRequestIdAndDeletedAtIsNull(pr.getId()).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Purchase order already exists for this request");
        }

        List<PurchaseRequestLineEntity> prLines =
                requestLineRepository.findByPurchaseRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(pr.getId());
        if (prLines.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Purchase request has no lines");
        }

        PurchaseOrderEntity order = new PurchaseOrderEntity();
        order.setTenantId(principal.getTenantId());
        order.setHospitalId(pr.getHospitalId());
        order.setBranchId(pr.getBranchId());
        order.setPurchaseRequestId(pr.getId());
        order.setOrderNumber(PurchaseRequestService.allocateNumber("PO"));
        order.setStatus("ISSUED");
        order.setVendorName(trimToNull(request.getVendorName()));
        order.setNotes(trimToNull(request.getNotes()));
        order.setTotalAmount(pr.getTotalAmount());
        order.setIssuedAt(Instant.now());
        order.setIssuedBy(principal.getUserId());
        order.setCreatedBy(principal.getUserId());
        order.setUpdatedBy(principal.getUserId());

        PurchaseOrderEntity savedOrder = orderRepository.save(order);

        for (PurchaseRequestLineEntity prLine : prLines) {
            PurchaseOrderLineEntity poLine = new PurchaseOrderLineEntity();
            poLine.setTenantId(principal.getTenantId());
            poLine.setPurchaseOrderId(savedOrder.getId());
            poLine.setInventoryItemId(prLine.getInventoryItemId());
            poLine.setItemCode(prLine.getItemCode());
            poLine.setItemName(prLine.getItemName());
            poLine.setQuantityOrdered(prLine.getQuantity());
            poLine.setQuantityReceived(0);
            poLine.setUnitPrice(prLine.getUnitPrice());
            poLine.setLineTotal(prLine.getLineTotal());
            poLine.setCreatedBy(principal.getUserId());
            poLine.setUpdatedBy(principal.getUserId());
            orderLineRepository.save(poLine);
        }

        pr.setStatus("ORDERED");
        pr.setUpdatedBy(principal.getUserId());
        pr.touch();
        requestRepository.save(pr);

        Map<String, Object> payload = new HashMap<>();
        payload.put("orderNumber", savedOrder.getOrderNumber());
        payload.put("purchaseRequestId", pr.getId());
        payload.put("requestNumber", pr.getRequestNumber());
        payload.put("vendorName", savedOrder.getVendorName());
        payload.put("totalAmount", savedOrder.getTotalAmount());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(savedOrder.getHospitalId())
                .branchId(savedOrder.getBranchId())
                .eventType(HospitalEventTypes.PURCHASE_ORDERED)
                .userId(principal.getUserId())
                .entityType("PurchaseOrder")
                .entityId(savedOrder.getId())
                .correlationId(pr.getId())
                .sourceModule("PROCUREMENT")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PROCUREMENT_PO_CREATED",
                "PurchaseOrder", savedOrder.getId(),
                Map.of("orderNumber", savedOrder.getOrderNumber(), "requestNumber", pr.getRequestNumber()));

        List<PurchaseOrderLineEntity> lines =
                orderLineRepository.findByPurchaseOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(savedOrder.getId());
        return toResponse(savedOrder, lines);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> list(
            UserPrincipal principal, UUID hospitalId, UUID branchId, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);

        return orderRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable)
                .map(order -> toResponse(order, orderLineRepository.findByPurchaseOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(order.getId())));
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse get(UserPrincipal principal, UUID orderId) {
        accessService.assertCanRead(principal);
        PurchaseOrderEntity order = require(principal.getTenantId(), orderId);
        accessService.assertModuleEnabled(principal, order.getHospitalId(), order.getBranchId());
        return toResponse(order, orderLineRepository.findByPurchaseOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(order.getId()));
    }

    PurchaseOrderEntity require(UUID tenantId, UUID orderId) {
        return orderRepository.findByIdAndTenantIdAndDeletedAtIsNull(orderId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Purchase order not found"));
    }

    private PurchaseOrderResponse toResponse(PurchaseOrderEntity entity, List<PurchaseOrderLineEntity> lines) {
        List<PurchaseOrderLineResponse> lineResponses = lines.stream()
                .map(line -> PurchaseOrderLineResponse.builder()
                        .id(line.getId())
                        .inventoryItemId(line.getInventoryItemId())
                        .itemCode(line.getItemCode())
                        .itemName(line.getItemName())
                        .quantityOrdered(line.getQuantityOrdered())
                        .quantityReceived(line.getQuantityReceived())
                        .unitPrice(line.getUnitPrice())
                        .lineTotal(line.getLineTotal())
                        .build())
                .toList();

        return PurchaseOrderResponse.builder()
                .id(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .purchaseRequestId(entity.getPurchaseRequestId())
                .orderNumber(entity.getOrderNumber())
                .status(entity.getStatus())
                .vendorName(entity.getVendorName())
                .notes(entity.getNotes())
                .totalAmount(entity.getTotalAmount())
                .issuedAt(entity.getIssuedAt())
                .issuedBy(entity.getIssuedBy())
                .createdAt(entity.getCreatedAt())
                .lines(lineResponses)
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
