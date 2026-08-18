package com.health360.clinical.application.service;

import com.health360.clinical.domain.ClinicalOrderStatus;
import com.health360.clinical.domain.ClinicalOrderType;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderRepository;
import com.health360.clinical.presentation.dto.request.CreateClinicalOrderRequest;
import com.health360.clinical.presentation.dto.response.ClinicalOrderResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalOrderService {

    private final ClinicalOrderRepository orderRepository;
    private final ClinicalOrderItemRepository orderItemRepository;
    private final EncounterService encounterService;
    private final EncounterAccessService accessService;
    private final ClinicalMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public ClinicalOrderResponse createOrder(
            UserPrincipal principal, UUID encounterId, CreateClinicalOrderRequest request) {
        if (!principal.hasPermission("clinical:order:write")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }

        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        ClinicalOrderType orderType = parseOrderType(request.getOrderType());

        ClinicalOrderEntity order = new ClinicalOrderEntity();
        order.setTenantId(principal.getTenantId());
        order.setEncounterId(encounterId);
        order.setOrderNumber(generateOrderNumber(encounterId));
        order.setOrderType(orderType.name());
        order.setStatus(ClinicalOrderStatus.ORDERED.name());
        order.setInstructions(trimToNull(request.getInstructions()));
        order.setCreatedBy(principal.getUserId());
        order.setUpdatedBy(principal.getUserId());

        ClinicalOrderEntity savedOrder = orderRepository.save(order);

        List<ClinicalOrderItemEntity> items = request.getItems().stream().map(itemRequest -> {
            ClinicalOrderItemEntity item = new ClinicalOrderItemEntity();
            item.setTenantId(principal.getTenantId());
            item.setOrderId(savedOrder.getId());
            item.setItemCode(trimToNull(itemRequest.getItemCode()));
            item.setItemName(itemRequest.getItemName().trim());
            item.setItemReferenceId(itemRequest.getItemReferenceId());
            item.setQuantity(itemRequest.getQuantity() != null && itemRequest.getQuantity() > 0
                    ? itemRequest.getQuantity() : 1);
            item.setInstructions(trimToNull(itemRequest.getInstructions()));
            item.setStatus(ClinicalOrderStatus.ORDERED.name());
            item.setCreatedBy(principal.getUserId());
            item.setUpdatedBy(principal.getUserId());
            return item;
        }).toList();

        List<ClinicalOrderItemEntity> savedItems = orderItemRepository.saveAll(items);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "CLINICAL_ORDER_PLACED", "ClinicalOrder", savedOrder.getId(),
                Map.of("encounterId", encounterId.toString(), "orderType", orderType.name()));

        return mapper.toOrderResponse(savedOrder, savedItems);
    }

    @Transactional(readOnly = true)
    public List<ClinicalOrderResponse> listOrders(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);

        return orderRepository.findByEncounterIdAndDeletedAtIsNullOrderByOrderedAtDesc(encounterId).stream()
                .map(order -> mapper.toOrderResponse(
                        order,
                        orderItemRepository.findByOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(order.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ClinicalOrderResponse getOrder(UserPrincipal principal, UUID encounterId, UUID orderId) {
        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);

        ClinicalOrderEntity order = orderRepository.findByIdAndTenantIdAndDeletedAtIsNull(orderId, principal.getTenantId())
                .filter(o -> o.getEncounterId().equals(encounterId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Order not found"));

        List<ClinicalOrderItemEntity> items = orderItemRepository
                .findByOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(orderId);

        return mapper.toOrderResponse(order, items);
    }

    private String generateOrderNumber(UUID encounterId) {
        long sequence = orderRepository.countByEncounterIdAndDeletedAtIsNull(encounterId) + 1;
        return "ORD-" + String.format("%04d", sequence);
    }

    private ClinicalOrderType parseOrderType(String raw) {
        try {
            return ClinicalOrderType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid order type. Allowed: " + Arrays.toString(ClinicalOrderType.values()));
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
