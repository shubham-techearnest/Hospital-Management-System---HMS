package com.health360.inventory.application.service;

import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.config.security.UserPrincipal;
import com.health360.inventory.infrastructure.persistence.entity.InventoryItemEntity;
import com.health360.inventory.infrastructure.persistence.entity.InventoryLocationEntity;
import com.health360.inventory.infrastructure.persistence.entity.InventoryStockBalanceEntity;
import com.health360.inventory.infrastructure.persistence.entity.InventoryStockTransactionEntity;
import com.health360.inventory.infrastructure.persistence.repository.InventoryItemRepository;
import com.health360.inventory.infrastructure.persistence.repository.InventoryLocationRepository;
import com.health360.inventory.infrastructure.persistence.repository.InventoryStockBalanceRepository;
import com.health360.inventory.infrastructure.persistence.repository.InventoryStockTransactionRepository;
import com.health360.inventory.presentation.dto.request.AdjustInventoryStockRequest;
import com.health360.inventory.presentation.dto.request.ReceiveInventoryStockRequest;
import com.health360.inventory.presentation.dto.response.StockBalanceResponse;
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
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryStockService {

    private final InventoryStockBalanceRepository balanceRepository;
    private final InventoryStockTransactionRepository transactionRepository;
    private final InventoryItemRepository itemRepository;
    private final InventoryLocationRepository locationRepository;
    private final InventoryCatalogService catalogService;
    private final InventoryAccessService accessService;
    private final EventPublisher eventPublisher;
    private final AuditLogService auditLogService;

    @Transactional
    public StockBalanceResponse receive(UserPrincipal principal, ReceiveInventoryStockRequest request) {
        accessService.assertCanWriteStock(principal);
        InventoryItemEntity item = catalogService.requireItemEntity(principal, request.getItemId());
        InventoryLocationEntity location = catalogService.requireLocation(principal, request.getLocationId());

        if (!item.getHospitalId().equals(location.getHospitalId())
                || !item.getBranchId().equals(location.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Item and location must belong to the same hospital branch");
        }

        String lot = normalizeLot(request.getLotNumber());
        if (item.isTrackExpiry() && request.getExpiryDate() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "expiryDate is required for items with track_expiry");
        }

        InventoryStockBalanceEntity balance = balanceRepository
                .findByItemIdAndLocationIdAndLotNumberAndDeletedAtIsNull(item.getId(), location.getId(), lot)
                .orElseGet(() -> {
                    InventoryStockBalanceEntity b = new InventoryStockBalanceEntity();
                    b.setTenantId(principal.getTenantId());
                    b.setItemId(item.getId());
                    b.setLocationId(location.getId());
                    b.setLotNumber(lot);
                    b.setQuantityOnHand(0);
                    b.setCreatedBy(principal.getUserId());
                    b.setUpdatedBy(principal.getUserId());
                    return b;
                });

        balance.setQuantityOnHand(balance.getQuantityOnHand() + request.getQuantity());
        if (request.getExpiryDate() != null) {
            balance.setExpiryDate(request.getExpiryDate());
        }
        if (request.getUnitCost() != null) {
            balance.setUnitCost(request.getUnitCost());
        }
        balance.setReceivedAt(Instant.now());
        balance.setUpdatedBy(principal.getUserId());
        balance.touch();
        InventoryStockBalanceEntity saved = balanceRepository.saveAndFlush(balance);

        recordTxn(principal, item, location, saved.getId(), "RECEIVE", request.getQuantity(),
                null, null, request.getNotes() != null ? request.getNotes() : "Stock received");

        publishStockEvent(principal, item, location, HospitalEventTypes.STOCK_RECEIVED, saved, request.getQuantity());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INVENTORY_STOCK_RECEIVED",
                "StockBalance", saved.getId(),
                Map.of("itemCode", item.getCode(), "qty", request.getQuantity()));

        checkLowStock(principal, item, location, saved);
        return toBalanceResponse(item, location, saved);
    }

    @Transactional
    public StockBalanceResponse receiveFromGrn(
            UserPrincipal principal,
            UUID itemId,
            UUID locationId,
            int quantity,
            String lotNumber,
            LocalDate expiryDate,
            BigDecimal unitCost,
            UUID goodsReceiptId,
            UUID goodsReceiptLineId,
            String notes) {
        InventoryItemEntity item = catalogService.requireItemEntity(principal, itemId);
        InventoryLocationEntity location = catalogService.requireLocation(principal, locationId);

        if (!item.getHospitalId().equals(location.getHospitalId())
                || !item.getBranchId().equals(location.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Item and location must belong to the same hospital branch");
        }

        String lot = normalizeLot(lotNumber);
        if (item.isTrackExpiry() && expiryDate == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "expiryDate is required for items with track_expiry");
        }

        InventoryStockBalanceEntity balance = balanceRepository
                .findByItemIdAndLocationIdAndLotNumberAndDeletedAtIsNull(item.getId(), location.getId(), lot)
                .orElseGet(() -> {
                    InventoryStockBalanceEntity b = new InventoryStockBalanceEntity();
                    b.setTenantId(principal.getTenantId());
                    b.setItemId(item.getId());
                    b.setLocationId(location.getId());
                    b.setLotNumber(lot);
                    b.setQuantityOnHand(0);
                    b.setCreatedBy(principal.getUserId());
                    b.setUpdatedBy(principal.getUserId());
                    return b;
                });

        balance.setQuantityOnHand(balance.getQuantityOnHand() + quantity);
        if (expiryDate != null) {
            balance.setExpiryDate(expiryDate);
        }
        if (unitCost != null) {
            balance.setUnitCost(unitCost);
        }
        balance.setReceivedAt(Instant.now());
        balance.setUpdatedBy(principal.getUserId());
        balance.touch();
        InventoryStockBalanceEntity saved = balanceRepository.saveAndFlush(balance);

        recordTxn(principal, item, location, saved.getId(), "RECEIVE", quantity,
                "GoodsReceipt", goodsReceiptId,
                notes != null ? notes : "GRN receive");

        publishStockEvent(principal, item, location, HospitalEventTypes.STOCK_RECEIVED, saved, quantity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INVENTORY_STOCK_RECEIVED",
                "StockBalance", saved.getId(),
                Map.of("itemCode", item.getCode(), "qty", quantity, "source", "GRN", "grnId", goodsReceiptId));

        checkLowStock(principal, item, location, saved);
        return toBalanceResponse(item, location, saved);
    }

    @Transactional
    public StockBalanceResponse adjust(UserPrincipal principal, AdjustInventoryStockRequest request) {
        accessService.assertCanWriteStock(principal);
        InventoryStockBalanceEntity balance = balanceRepository.findById(request.getBalanceId())
                .filter(b -> b.getDeletedAt() == null && b.getTenantId().equals(principal.getTenantId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Stock balance not found"));

        InventoryItemEntity item = catalogService.requireItemEntity(principal, balance.getItemId());
        InventoryLocationEntity location = catalogService.requireLocation(principal, balance.getLocationId());

        int newQty = balance.getQuantityOnHand() + request.getQuantityDelta();
        if (newQty < 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Adjustment would make quantity negative");
        }

        balance.setQuantityOnHand(newQty);
        balance.setUpdatedBy(principal.getUserId());
        balance.touch();
        InventoryStockBalanceEntity saved = balanceRepository.saveAndFlush(balance);

        recordTxn(principal, item, location, saved.getId(), "ADJUST", request.getQuantityDelta(),
                null, null, request.getNotes() != null ? request.getNotes() : "Stock adjusted");

        publishStockEvent(principal, item, location, HospitalEventTypes.STOCK_ADJUSTED, saved,
                request.getQuantityDelta());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INVENTORY_STOCK_ADJUSTED",
                "StockBalance", saved.getId(),
                Map.of("delta", request.getQuantityDelta()));

        checkLowStock(principal, item, location, saved);
        return toBalanceResponse(item, location, saved);
    }

    @Transactional(readOnly = true)
    public Page<StockBalanceResponse> listBalances(
            UserPrincipal principal,
            UUID hospitalId,
            UUID branchId,
            UUID locationId,
            boolean lowStockOnly,
            Pageable pageable) {
        accessService.assertCanReadStock(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);

        return balanceRepository.findBoard(
                        principal.getTenantId(), hospitalId, branchId, locationId, lowStockOnly, pageable)
                .map(b -> {
                    InventoryItemEntity item = itemRepository.findById(b.getItemId()).orElseThrow();
                    InventoryLocationEntity location = locationRepository.findById(b.getLocationId()).orElseThrow();
                    return toBalanceResponse(item, location, b);
                });
    }

    private void checkLowStock(
            UserPrincipal principal,
            InventoryItemEntity item,
            InventoryLocationEntity location,
            InventoryStockBalanceEntity balance) {
        if (item.getReorderLevel() == null) {
            return;
        }
        int totalOnHand = balanceRepository.sumOnHand(item.getId());
        if (totalOnHand > item.getReorderLevel()) {
            return;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("itemCode", item.getCode());
        payload.put("itemName", item.getName());
        payload.put("locationCode", location.getCode());
        payload.put("quantityOnHand", totalOnHand);
        payload.put("reorderLevel", item.getReorderLevel());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(item.getHospitalId())
                .branchId(item.getBranchId())
                .eventType(HospitalEventTypes.STOCK_LOW)
                .userId(principal.getUserId())
                .entityType("InventoryItem")
                .entityId(item.getId())
                .correlationId(balance.getId())
                .sourceModule("INVENTORY")
                .payload(payload)
                .build());
    }

    private void publishStockEvent(
            UserPrincipal principal,
            InventoryItemEntity item,
            InventoryLocationEntity location,
            String eventType,
            InventoryStockBalanceEntity balance,
            int quantity) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("itemCode", item.getCode());
        payload.put("locationCode", location.getCode());
        payload.put("quantity", quantity);
        payload.put("quantityOnHand", balance.getQuantityOnHand());

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(item.getHospitalId())
                .branchId(item.getBranchId())
                .eventType(eventType)
                .userId(principal.getUserId())
                .entityType("StockBalance")
                .entityId(balance.getId())
                .correlationId(balance.getId())
                .sourceModule("INVENTORY")
                .payload(payload)
                .build());
    }

    private void recordTxn(
            UserPrincipal principal,
            InventoryItemEntity item,
            InventoryLocationEntity location,
            UUID balanceId,
            String txnType,
            int quantity,
            String referenceType,
            UUID referenceId,
            String notes) {
        InventoryStockTransactionEntity txn = new InventoryStockTransactionEntity();
        txn.setTenantId(principal.getTenantId());
        txn.setHospitalId(item.getHospitalId());
        txn.setBranchId(item.getBranchId());
        txn.setItemId(item.getId());
        txn.setBalanceId(balanceId);
        txn.setLocationId(location.getId());
        txn.setTxnType(txnType);
        txn.setQuantity(quantity);
        txn.setReferenceType(referenceType);
        txn.setReferenceId(referenceId);
        txn.setNotes(notes);
        txn.setCreatedBy(principal.getUserId());
        transactionRepository.save(txn);
    }

    private StockBalanceResponse toBalanceResponse(
            InventoryItemEntity item, InventoryLocationEntity location, InventoryStockBalanceEntity balance) {
        int onHand = balance.getQuantityOnHand();
        boolean low = item.getReorderLevel() != null && onHand <= item.getReorderLevel();
        return StockBalanceResponse.builder()
                .id(balance.getId())
                .itemId(item.getId())
                .itemCode(item.getCode())
                .itemName(item.getName())
                .locationId(location.getId())
                .locationCode(location.getCode())
                .locationName(location.getName())
                .lotNumber(balance.getLotNumber())
                .expiryDate(balance.getExpiryDate())
                .quantityOnHand(onHand)
                .unitCost(balance.getUnitCost())
                .reorderLevel(item.getReorderLevel())
                .lowStock(low)
                .build();
    }

    private static String normalizeLot(String lotNumber) {
        if (lotNumber == null || lotNumber.isBlank()) {
            return "";
        }
        return lotNumber.trim();
    }
}
