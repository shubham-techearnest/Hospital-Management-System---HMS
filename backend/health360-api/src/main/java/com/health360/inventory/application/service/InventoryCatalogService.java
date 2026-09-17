package com.health360.inventory.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.inventory.infrastructure.persistence.entity.InventoryItemEntity;
import com.health360.inventory.infrastructure.persistence.entity.InventoryLocationEntity;
import com.health360.inventory.infrastructure.persistence.repository.InventoryItemRepository;
import com.health360.inventory.infrastructure.persistence.repository.InventoryLocationRepository;
import com.health360.inventory.infrastructure.persistence.repository.InventoryStockBalanceRepository;
import com.health360.inventory.presentation.dto.request.CreateInventoryItemRequest;
import com.health360.inventory.presentation.dto.response.InventoryItemResponse;
import com.health360.inventory.presentation.dto.response.InventoryLocationResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryCatalogService {

    private final InventoryItemRepository itemRepository;
    private final InventoryLocationRepository locationRepository;
    private final InventoryStockBalanceRepository balanceRepository;
    private final InventoryAccessService accessService;
    private final AuditLogService auditLogService;

    @Transactional
    public InventoryItemResponse createItem(UserPrincipal principal, CreateInventoryItemRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        String code = request.getCode().trim().toUpperCase(Locale.ROOT);
        if (itemRepository.existsByTenantIdAndHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                principal.getTenantId(), request.getHospitalId(), request.getBranchId(), code)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Item code already exists");
        }

        InventoryItemEntity item = new InventoryItemEntity();
        item.setTenantId(principal.getTenantId());
        item.setHospitalId(request.getHospitalId());
        item.setBranchId(request.getBranchId());
        item.setCode(code);
        item.setName(request.getName().trim());
        item.setCategory(trimOrDefault(request.getCategory(), "GENERAL").toUpperCase(Locale.ROOT));
        item.setUnitOfMeasure(trimOrDefault(request.getUnitOfMeasure(), "EACH").toUpperCase(Locale.ROOT));
        item.setReorderLevel(request.getReorderLevel());
        item.setTrackExpiry(Boolean.TRUE.equals(request.getTrackExpiry()));
        item.setCreatedBy(principal.getUserId());
        item.setUpdatedBy(principal.getUserId());
        InventoryItemEntity saved = itemRepository.save(item);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INVENTORY_ITEM_CREATED",
                "InventoryItem", saved.getId(), Map.of("code", saved.getCode()));

        return toItemResponse(saved, 0);
    }

    @Transactional(readOnly = true)
    public Page<InventoryItemResponse> listItems(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String category, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);

        Page<InventoryItemEntity> page = category != null && !category.isBlank()
                ? itemRepository.findByTenantIdAndHospitalIdAndBranchIdAndCategoryAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId, category.trim().toUpperCase(Locale.ROOT),
                        pageable)
                : itemRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId, pageable);

        return page.map(item -> toItemResponse(item, balanceRepository.sumOnHand(item.getId())));
    }

    @Transactional(readOnly = true)
    public InventoryItemResponse getItem(UserPrincipal principal, UUID itemId) {
        accessService.assertCanRead(principal);
        InventoryItemEntity item = requireItem(principal.getTenantId(), itemId);
        accessService.assertModuleEnabled(principal, item.getHospitalId(), item.getBranchId());
        return toItemResponse(item, balanceRepository.sumOnHand(item.getId()));
    }

    @Transactional(readOnly = true)
    public List<InventoryLocationResponse> listLocations(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        return locationRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(this::toLocationResponse)
                .toList();
    }

    private InventoryItemEntity requireItem(UUID tenantId, UUID itemId) {
        return itemRepository.findByIdAndTenantIdAndDeletedAtIsNull(itemId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Inventory item not found"));
    }

    public InventoryItemEntity requireItemEntity(UserPrincipal principal, UUID itemId) {
        InventoryItemEntity item = requireItem(principal.getTenantId(), itemId);
        accessService.assertModuleEnabled(principal, item.getHospitalId(), item.getBranchId());
        return item;
    }

    public InventoryLocationEntity requireLocation(UserPrincipal principal, UUID locationId) {
        InventoryLocationEntity location = locationRepository.findByIdAndTenantIdAndDeletedAtIsNull(
                        locationId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Inventory location not found"));
        accessService.assertModuleEnabled(principal, location.getHospitalId(), location.getBranchId());
        return location;
    }

    private InventoryItemResponse toItemResponse(InventoryItemEntity item, Integer onHand) {
        return InventoryItemResponse.builder()
                .id(item.getId())
                .hospitalId(item.getHospitalId())
                .branchId(item.getBranchId())
                .code(item.getCode())
                .name(item.getName())
                .category(item.getCategory())
                .unitOfMeasure(item.getUnitOfMeasure())
                .reorderLevel(item.getReorderLevel())
                .trackExpiry(item.isTrackExpiry())
                .active(item.isActive())
                .quantityOnHand(onHand != null ? onHand : 0)
                .build();
    }

    private InventoryLocationResponse toLocationResponse(InventoryLocationEntity location) {
        return InventoryLocationResponse.builder()
                .id(location.getId())
                .hospitalId(location.getHospitalId())
                .branchId(location.getBranchId())
                .code(location.getCode())
                .name(location.getName())
                .locationType(location.getLocationType())
                .departmentId(location.getDepartmentId())
                .active(location.isActive())
                .build();
    }

    private static String trimOrDefault(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value.trim();
    }
}
