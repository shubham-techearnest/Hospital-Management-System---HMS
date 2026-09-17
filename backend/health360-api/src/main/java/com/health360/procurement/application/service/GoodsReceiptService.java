package com.health360.procurement.application.service;

import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.config.security.UserPrincipal;
import com.health360.inventory.application.service.InventoryCatalogService;
import com.health360.inventory.application.service.InventoryStockService;
import com.health360.inventory.infrastructure.persistence.entity.InventoryLocationEntity;
import com.health360.procurement.infrastructure.persistence.entity.GoodsReceiptEntity;
import com.health360.procurement.infrastructure.persistence.entity.GoodsReceiptLineEntity;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseOrderEntity;
import com.health360.procurement.infrastructure.persistence.entity.PurchaseOrderLineEntity;
import com.health360.procurement.infrastructure.persistence.repository.GoodsReceiptLineRepository;
import com.health360.procurement.infrastructure.persistence.repository.GoodsReceiptRepository;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseOrderLineRepository;
import com.health360.procurement.infrastructure.persistence.repository.PurchaseOrderRepository;
import com.health360.procurement.presentation.dto.request.PostGoodsReceiptLinePayload;
import com.health360.procurement.presentation.dto.request.PostGoodsReceiptPayload;
import com.health360.procurement.presentation.dto.response.GoodsReceiptLineResponse;
import com.health360.procurement.presentation.dto.response.GoodsReceiptResponse;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptRepository receiptRepository;
    private final GoodsReceiptLineRepository receiptLineRepository;
    private final PurchaseOrderService purchaseOrderService;
    private final PurchaseOrderRepository orderRepository;
    private final PurchaseOrderLineRepository orderLineRepository;
    private final InventoryCatalogService inventoryCatalogService;
    private final InventoryStockService inventoryStockService;
    private final ProcurementAccessService accessService;
    private final EventPublisher eventPublisher;
    private final AuditLogService auditLogService;

    @Transactional
    public GoodsReceiptResponse post(UserPrincipal principal, PostGoodsReceiptPayload request) {
        accessService.assertCanReceive(principal);
        PurchaseOrderEntity order = purchaseOrderService.require(principal.getTenantId(), request.getPurchaseOrderId());
        accessService.assertModuleEnabled(principal, order.getHospitalId(), order.getBranchId());

        if ("CANCELLED".equals(order.getStatus()) || "RECEIVED".equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Cannot receive goods for order in status " + order.getStatus());
        }

        InventoryLocationEntity location = inventoryCatalogService.requireLocation(principal, request.getLocationId());
        if (!location.getHospitalId().equals(order.getHospitalId())
                || !location.getBranchId().equals(order.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Location must belong to the same hospital branch as the purchase order");
        }

        Map<UUID, PurchaseOrderLineEntity> poLines = orderLineRepository
                .findByPurchaseOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(order.getId())
                .stream()
                .collect(Collectors.toMap(PurchaseOrderLineEntity::getId, Function.identity()));

        GoodsReceiptEntity receipt = new GoodsReceiptEntity();
        receipt.setTenantId(principal.getTenantId());
        receipt.setHospitalId(order.getHospitalId());
        receipt.setBranchId(order.getBranchId());
        receipt.setPurchaseOrderId(order.getId());
        receipt.setGrnNumber(PurchaseRequestService.allocateNumber("GRN"));
        receipt.setStatus("POSTED");
        receipt.setLocationId(location.getId());
        receipt.setNotes(trimToNull(request.getNotes()));
        receipt.setReceivedAt(Instant.now());
        receipt.setReceivedBy(principal.getUserId());
        receipt.setCreatedBy(principal.getUserId());
        receipt.setUpdatedBy(principal.getUserId());

        GoodsReceiptEntity savedReceipt = receiptRepository.save(receipt);
        List<GoodsReceiptLineEntity> savedLines = new ArrayList<>();

        for (PostGoodsReceiptLinePayload linePayload : request.getLines()) {
            PurchaseOrderLineEntity poLine = poLines.get(linePayload.getPurchaseOrderLineId());
            if (poLine == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Purchase order line not found: " + linePayload.getPurchaseOrderLineId());
            }

            int remaining = poLine.getQuantityOrdered() - poLine.getQuantityReceived();
            if (linePayload.getQuantityReceived() > remaining) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Quantity exceeds remaining for line " + poLine.getItemCode());
            }
            if (poLine.getInventoryItemId() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "PO line must be linked to an inventory item to post GRN: " + poLine.getItemCode());
            }

            String lot = linePayload.getLotNumber() != null ? linePayload.getLotNumber().trim() : "";

            GoodsReceiptLineEntity grnLine = new GoodsReceiptLineEntity();
            grnLine.setTenantId(principal.getTenantId());
            grnLine.setGoodsReceiptId(savedReceipt.getId());
            grnLine.setPurchaseOrderLineId(poLine.getId());
            grnLine.setInventoryItemId(poLine.getInventoryItemId());
            grnLine.setQuantityReceived(linePayload.getQuantityReceived());
            grnLine.setLotNumber(lot);
            grnLine.setExpiryDate(linePayload.getExpiryDate());
            grnLine.setUnitCost(linePayload.getUnitCost() != null ? linePayload.getUnitCost() : poLine.getUnitPrice());
            grnLine.setCreatedBy(principal.getUserId());
            grnLine.setUpdatedBy(principal.getUserId());
            savedLines.add(receiptLineRepository.save(grnLine));

            inventoryStockService.receiveFromGrn(
                    principal,
                    poLine.getInventoryItemId(),
                    location.getId(),
                    linePayload.getQuantityReceived(),
                    lot,
                    linePayload.getExpiryDate(),
                    grnLine.getUnitCost(),
                    savedReceipt.getId(),
                    grnLine.getId(),
                    "GRN " + savedReceipt.getGrnNumber());

            poLine.setQuantityReceived(poLine.getQuantityReceived() + linePayload.getQuantityReceived());
            poLine.setUpdatedBy(principal.getUserId());
            poLine.touch();
            orderLineRepository.save(poLine);
        }

        boolean fullyReceived = poLines.values().stream()
                .allMatch(line -> line.getQuantityReceived() >= line.getQuantityOrdered());
        boolean anyReceived = poLines.values().stream()
                .anyMatch(line -> line.getQuantityReceived() > 0);

        if (fullyReceived) {
            order.setStatus("RECEIVED");
        } else if (anyReceived) {
            order.setStatus("PARTIALLY_RECEIVED");
        }
        order.setUpdatedBy(principal.getUserId());
        order.touch();
        orderRepository.save(order);

        Map<String, Object> payload = new HashMap<>();
        payload.put("grnNumber", savedReceipt.getGrnNumber());
        payload.put("purchaseOrderId", order.getId());
        payload.put("orderNumber", order.getOrderNumber());
        payload.put("locationId", location.getId());
        payload.put("lineCount", savedLines.size());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(order.getHospitalId())
                .branchId(order.getBranchId())
                .eventType(HospitalEventTypes.GOODS_RECEIVED)
                .userId(principal.getUserId())
                .entityType("GoodsReceipt")
                .entityId(savedReceipt.getId())
                .correlationId(order.getId())
                .sourceModule("PROCUREMENT")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PROCUREMENT_GRN_POSTED",
                "GoodsReceipt", savedReceipt.getId(),
                Map.of("grnNumber", savedReceipt.getGrnNumber(), "orderNumber", order.getOrderNumber()));

        return toResponse(savedReceipt, savedLines);
    }

    @Transactional(readOnly = true)
    public Page<GoodsReceiptResponse> list(
            UserPrincipal principal, UUID hospitalId, UUID branchId, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);

        return receiptRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable)
                .map(receipt -> toResponse(receipt,
                        receiptLineRepository.findByGoodsReceiptIdAndDeletedAtIsNullOrderByCreatedAtAsc(receipt.getId())));
    }

    @Transactional(readOnly = true)
    public GoodsReceiptResponse get(UserPrincipal principal, UUID receiptId) {
        accessService.assertCanRead(principal);
        GoodsReceiptEntity receipt = require(principal.getTenantId(), receiptId);
        accessService.assertModuleEnabled(principal, receipt.getHospitalId(), receipt.getBranchId());
        return toResponse(receipt,
                receiptLineRepository.findByGoodsReceiptIdAndDeletedAtIsNullOrderByCreatedAtAsc(receipt.getId()));
    }

    private GoodsReceiptEntity require(UUID tenantId, UUID receiptId) {
        return receiptRepository.findByIdAndTenantIdAndDeletedAtIsNull(receiptId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Goods receipt not found"));
    }

    private GoodsReceiptResponse toResponse(GoodsReceiptEntity entity, List<GoodsReceiptLineEntity> lines) {
        List<GoodsReceiptLineResponse> lineResponses = lines.stream()
                .map(line -> GoodsReceiptLineResponse.builder()
                        .id(line.getId())
                        .purchaseOrderLineId(line.getPurchaseOrderLineId())
                        .inventoryItemId(line.getInventoryItemId())
                        .quantityReceived(line.getQuantityReceived())
                        .lotNumber(line.getLotNumber())
                        .expiryDate(line.getExpiryDate())
                        .unitCost(line.getUnitCost())
                        .build())
                .toList();

        return GoodsReceiptResponse.builder()
                .id(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .purchaseOrderId(entity.getPurchaseOrderId())
                .grnNumber(entity.getGrnNumber())
                .status(entity.getStatus())
                .locationId(entity.getLocationId())
                .notes(entity.getNotes())
                .receivedAt(entity.getReceivedAt())
                .receivedBy(entity.getReceivedBy())
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
