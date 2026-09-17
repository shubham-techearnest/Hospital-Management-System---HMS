package com.health360.asset.application.service;

import com.health360.asset.domain.AssetStatus;
import com.health360.asset.domain.MaintenanceType;
import com.health360.asset.infrastructure.persistence.entity.AssetCategoryEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceLogEntity;
import com.health360.asset.infrastructure.persistence.repository.AssetCategoryRepository;
import com.health360.asset.infrastructure.persistence.repository.AssetMaintenanceLogRepository;
import com.health360.asset.infrastructure.persistence.repository.AssetRepository;
import com.health360.asset.presentation.dto.request.CreateAssetMaintenanceRequest;
import com.health360.asset.presentation.dto.request.CreateAssetRequest;
import com.health360.asset.presentation.dto.request.UpdateAssetRequest;
import com.health360.asset.presentation.dto.request.UpdateAssetStatusRequest;
import com.health360.asset.presentation.dto.response.AssetCategoryResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceResponse;
import com.health360.asset.presentation.dto.response.AssetResponse;
import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.DepartmentEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
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
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetService {

    private static final Set<AssetStatus> TERMINAL = EnumSet.of(AssetStatus.RETIRED, AssetStatus.DISPOSED);

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository categoryRepository;
    private final AssetMaintenanceLogRepository maintenanceLogRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetAccessService accessService;
    private final AssetMapper mapper;
    private final AuditLogService auditLogService;
    private final EventPublisher eventPublisher;
    private final AssetEamService assetEamService;

    @Transactional(readOnly = true)
    public List<AssetCategoryResponse> listCategories(UserPrincipal principal) {
        accessService.assertCanRead(principal);
        return categoryRepository
                .findByTenantIdAndActiveTrueAndDeletedAtIsNullOrderByNameAsc(principal.getTenantId())
                .stream()
                .map(mapper::toCategoryResponse)
                .toList();
    }

    @Transactional
    public AssetResponse createAsset(UserPrincipal principal, CreateAssetRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId());
        requireHospital(principal.getTenantId(), request.getHospitalId());
        requireBranch(principal.getTenantId(), request.getHospitalId(), request.getBranchId());
        AssetCategoryEntity category = requireCategory(principal.getTenantId(), request.getCategoryId());
        if (request.getDepartmentId() != null) {
            requireDepartment(principal.getTenantId(), request.getHospitalId(), request.getDepartmentId());
        }

        String tag = request.getAssetTag().trim().toUpperCase();
        if (assetRepository.existsByHospitalIdAndBranchIdAndAssetTagAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), tag)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Asset tag already exists for this branch");
        }

        AssetEntity asset = new AssetEntity();
        asset.setTenantId(principal.getTenantId());
        asset.setHospitalId(request.getHospitalId());
        asset.setBranchId(request.getBranchId());
        asset.setCategoryId(category.getId());
        asset.setDepartmentId(request.getDepartmentId());
        asset.setName(request.getName().trim());
        asset.setAssetTag(tag);
        asset.setSerialNumber(trimToNull(request.getSerialNumber()));
        asset.setManufacturer(trimToNull(request.getManufacturer()));
        asset.setModel(trimToNull(request.getModel()));
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setPurchaseCost(request.getPurchaseCost());
        asset.setSupplierName(trimToNull(request.getSupplierName()));
        asset.setWarrantyExpiry(request.getWarrantyExpiry());
        asset.setAmcExpiry(request.getAmcExpiry());
        asset.setLocationLabel(trimToNull(request.getLocationLabel()));
        asset.setStatus(AssetStatus.AVAILABLE.name());
        asset.setCriticality(normalizeCriticality(request.getCriticality()));
        asset.setNotes(trimToNull(request.getNotes()));
        asset.setCreatedBy(principal.getUserId());
        asset.setUpdatedBy(principal.getUserId());

        AssetEntity saved = assetRepository.save(asset);
        saved.setQrPayload("AST:" + saved.getId());
        saved = assetRepository.save(saved);

        assetEamService.recordStatusHistory(principal, saved, null, saved.getStatus(), "Asset registered");

        Map<String, Object> payload = new HashMap<>();
        payload.put("assetTag", saved.getAssetTag());
        payload.put("qrPayload", saved.getQrPayload());
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.ASSET_CREATED)
                .userId(principal.getUserId())
                .entityType("Asset")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("ASSET")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_CREATED",
                "Asset", saved.getId(), Map.of("assetTag", saved.getAssetTag()));
        return mapper.toAssetResponse(saved, category);
    }

    @Transactional(readOnly = true)
    public Page<AssetResponse> listAssets(
            UserPrincipal principal,
            UUID hospitalId,
            UUID branchId,
            String status,
            UUID categoryId,
            String q,
            Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId);
        String statusFilter = status != null && !status.isBlank() ? parseStatus(status).name() : null;
        String query = q != null && !q.isBlank() ? q.trim() : null;
        return assetRepository
                .search(principal.getTenantId(), hospitalId, branchId, statusFilter, categoryId, query, pageable)
                .map(a -> mapper.toAssetResponse(a, categoryRepository.findById(a.getCategoryId()).orElse(null)));
    }

    @Transactional(readOnly = true)
    public AssetResponse getAsset(UserPrincipal principal, UUID assetId) {
        accessService.assertCanRead(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());
        return mapper.toAssetResponse(asset, categoryRepository.findById(asset.getCategoryId()).orElse(null));
    }

    @Transactional
    public AssetResponse updateAsset(UserPrincipal principal, UUID assetId, UpdateAssetRequest request) {
        accessService.assertCanWrite(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());

        AssetStatus current = parseStatus(asset.getStatus());
        if (TERMINAL.contains(current)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Retired or disposed assets cannot be edited");
        }

        AssetCategoryEntity category = categoryRepository.findById(asset.getCategoryId()).orElse(null);
        if (request.getCategoryId() != null) {
            category = requireCategory(principal.getTenantId(), request.getCategoryId());
            asset.setCategoryId(category.getId());
        }
        if (request.getDepartmentId() != null) {
            requireDepartment(principal.getTenantId(), asset.getHospitalId(), request.getDepartmentId());
            asset.setDepartmentId(request.getDepartmentId());
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            asset.setName(request.getName().trim());
        }
        if (request.getAssetTag() != null && !request.getAssetTag().isBlank()) {
            String tag = request.getAssetTag().trim().toUpperCase();
            if (assetRepository.existsByHospitalIdAndBranchIdAndAssetTagAndIdNotAndDeletedAtIsNull(
                    asset.getHospitalId(), asset.getBranchId(), tag, asset.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "Asset tag already exists for this branch");
            }
            asset.setAssetTag(tag);
        }
        if (request.getSerialNumber() != null) {
            asset.setSerialNumber(trimToNull(request.getSerialNumber()));
        }
        if (request.getManufacturer() != null) {
            asset.setManufacturer(trimToNull(request.getManufacturer()));
        }
        if (request.getModel() != null) {
            asset.setModel(trimToNull(request.getModel()));
        }
        if (request.getPurchaseDate() != null) {
            asset.setPurchaseDate(request.getPurchaseDate());
        }
        if (request.getWarrantyExpiry() != null) {
            asset.setWarrantyExpiry(request.getWarrantyExpiry());
        }
        if (request.getLocationLabel() != null) {
            asset.setLocationLabel(trimToNull(request.getLocationLabel()));
        }
        if (request.getNotes() != null) {
            asset.setNotes(trimToNull(request.getNotes()));
        }

        asset.setUpdatedBy(principal.getUserId());
        asset.touch();
        AssetEntity saved = assetRepository.save(asset);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_UPDATED",
                "Asset", saved.getId(), Map.of("assetTag", saved.getAssetTag()));
        return mapper.toAssetResponse(saved, category);
    }

    @Transactional
    public AssetResponse updateStatus(UserPrincipal principal, UUID assetId, UpdateAssetStatusRequest request) {
        if (AssetStatus.DISPOSED.name().equalsIgnoreCase(request.getStatus().trim())
                || AssetStatus.RETIRED.name().equalsIgnoreCase(request.getStatus().trim())) {
            accessService.assertCanDispose(principal);
        } else {
            accessService.assertCanWrite(principal);
        }
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());

        AssetStatus from = parseStatus(asset.getStatus());
        AssetStatus to = parseStatus(request.getStatus());
        assertValidTransition(from, to);

        asset.setStatus(to.name());
        asset.setUpdatedBy(principal.getUserId());
        asset.touch();
        AssetEntity saved = assetRepository.save(asset);
        assetEamService.recordStatusHistory(principal, saved, from.name(), to.name(), "Status change");

        if (to == AssetStatus.DISPOSED) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("assetTag", saved.getAssetTag());
            payload.put("from", from.name());
            eventPublisher.publish(EventPublisher.PublishRequest.builder()
                    .tenantId(principal.getTenantId())
                    .hospitalId(saved.getHospitalId())
                    .branchId(saved.getBranchId())
                    .eventType(HospitalEventTypes.ASSET_DISPOSED)
                    .userId(principal.getUserId())
                    .entityType("Asset")
                    .entityId(saved.getId())
                    .correlationId(saved.getId())
                    .sourceModule("ASSET")
                    .payload(payload)
                    .build());
        }

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_STATUS_CHANGED",
                "Asset", saved.getId(), Map.of("from", from.name(), "to", to.name()));
        return mapper.toAssetResponse(saved, categoryRepository.findById(saved.getCategoryId()).orElse(null));
    }

    @Transactional
    public AssetMaintenanceResponse addMaintenance(
            UserPrincipal principal, UUID assetId, CreateAssetMaintenanceRequest request) {
        accessService.assertCanWriteMaintenance(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());

        if (AssetStatus.DISPOSED.name().equals(asset.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Cannot record maintenance for disposed assets");
        }

        MaintenanceType type = parseMaintenanceType(request.getMaintenanceType());
        AssetMaintenanceLogEntity log = new AssetMaintenanceLogEntity();
        log.setTenantId(principal.getTenantId());
        log.setAssetId(assetId);
        log.setMaintenanceType(type.name());
        log.setPerformedAt(request.getPerformedAt() != null ? request.getPerformedAt() : Instant.now());
        log.setPerformedBy(principal.getUserId());
        log.setNotes(trimToNull(request.getNotes()));
        log.setNextDueAt(request.getNextDueAt());
        log.setCostAmount(request.getCostAmount());
        log.setCreatedBy(principal.getUserId());
        log.setUpdatedBy(principal.getUserId());

        if (type == MaintenanceType.CORRECTIVE || type == MaintenanceType.PREVENTIVE
                || type == MaintenanceType.CALIBRATION) {
            if (AssetStatus.AVAILABLE.name().equals(asset.getStatus())
                    || AssetStatus.IN_USE.name().equals(asset.getStatus())) {
                asset.setStatus(AssetStatus.MAINTENANCE.name());
                asset.setUpdatedBy(principal.getUserId());
                asset.touch();
                assetRepository.save(asset);
            }
        }

        AssetMaintenanceLogEntity saved = maintenanceLogRepository.save(log);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_MAINTENANCE_RECORDED",
                "AssetMaintenance", saved.getId(), Map.of("assetId", assetId.toString(), "type", type.name()));
        return mapper.toMaintenanceResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssetMaintenanceResponse> listMaintenance(UserPrincipal principal, UUID assetId) {
        accessService.assertCanRead(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());
        return maintenanceLogRepository
                .findByTenantIdAndAssetIdAndDeletedAtIsNullOrderByPerformedAtDesc(principal.getTenantId(), assetId)
                .stream()
                .map(mapper::toMaintenanceResponse)
                .toList();
    }

    private void assertValidTransition(AssetStatus from, AssetStatus to) {
        if (from == to) {
            return;
        }
        if (from == AssetStatus.DISPOSED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Disposed assets cannot change status");
        }
        if (from == AssetStatus.RETIRED && to != AssetStatus.DISPOSED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Retired assets can only be disposed");
        }
        boolean allowed = switch (from) {
            case AVAILABLE -> to == AssetStatus.IN_USE || to == AssetStatus.MAINTENANCE
                    || to == AssetStatus.UNDER_REPAIR || to == AssetStatus.RETIRED || to == AssetStatus.DISPOSED;
            case IN_USE -> to == AssetStatus.AVAILABLE || to == AssetStatus.MAINTENANCE
                    || to == AssetStatus.UNDER_REPAIR || to == AssetStatus.RETIRED;
            case MAINTENANCE -> to == AssetStatus.AVAILABLE || to == AssetStatus.IN_USE
                    || to == AssetStatus.UNDER_REPAIR || to == AssetStatus.RETIRED || to == AssetStatus.DISPOSED;
            case UNDER_REPAIR -> to == AssetStatus.AVAILABLE || to == AssetStatus.IN_USE
                    || to == AssetStatus.MAINTENANCE || to == AssetStatus.RETIRED || to == AssetStatus.DISPOSED;
            case RETIRED -> to == AssetStatus.DISPOSED;
            case DISPOSED -> false;
        };
        if (!allowed) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Invalid status transition from " + from + " to " + to);
        }
    }

    private AssetEntity requireAsset(UUID tenantId, UUID assetId) {
        return assetRepository.findByIdAndTenantIdAndDeletedAtIsNull(assetId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Asset not found"));
    }

    private AssetCategoryEntity requireCategory(UUID tenantId, UUID categoryId) {
        return categoryRepository.findByIdAndTenantIdAndDeletedAtIsNull(categoryId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Asset category not found"));
    }

    private void requireHospital(UUID tenantId, UUID hospitalId) {
        hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Hospital not found"));
    }

    private void requireBranch(UUID tenantId, UUID hospitalId, UUID branchId) {
        BranchEntity branch = branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospitalId)
                .filter(b -> b.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Branch not found"));
        if (!branch.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Branch does not belong to the hospital");
        }
    }

    private void requireDepartment(UUID tenantId, UUID hospitalId, UUID departmentId) {
        DepartmentEntity dept = departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(departmentId, hospitalId)
                .filter(d -> d.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Department not found"));
        if (!dept.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Department does not belong to the hospital");
        }
    }

    private AssetStatus parseStatus(String raw) {
        try {
            return AssetStatus.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid asset status: " + raw);
        }
    }

    private MaintenanceType parseMaintenanceType(String raw) {
        try {
            return MaintenanceType.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid maintenance type: " + raw);
        }
    }

    private String normalizeCriticality(String raw) {
        if (raw == null || raw.isBlank()) {
            return "NORMAL";
        }
        String value = raw.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("LOW", "NORMAL", "HIGH", "CRITICAL").contains(value)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid criticality: " + raw);
        }
        return value;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
