package com.health360.asset.application.service;

import com.health360.asset.infrastructure.persistence.entity.AssetCategoryEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceLogEntity;
import com.health360.asset.presentation.dto.response.AssetCategoryResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceResponse;
import com.health360.asset.presentation.dto.response.AssetResponse;
import org.springframework.stereotype.Component;

@Component
public class AssetMapper {

    public AssetCategoryResponse toCategoryResponse(AssetCategoryEntity entity) {
        return AssetCategoryResponse.builder()
                .categoryId(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .active(entity.isActive())
                .build();
    }

    public AssetResponse toAssetResponse(AssetEntity entity, AssetCategoryEntity category) {
        return AssetResponse.builder()
                .assetId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .categoryId(entity.getCategoryId())
                .categoryCode(category != null ? category.getCode() : null)
                .categoryName(category != null ? category.getName() : null)
                .departmentId(entity.getDepartmentId())
                .name(entity.getName())
                .assetTag(entity.getAssetTag())
                .serialNumber(entity.getSerialNumber())
                .manufacturer(entity.getManufacturer())
                .model(entity.getModel())
                .purchaseDate(entity.getPurchaseDate())
                .warrantyExpiry(entity.getWarrantyExpiry())
                .locationLabel(entity.getLocationLabel())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public AssetMaintenanceResponse toMaintenanceResponse(AssetMaintenanceLogEntity entity) {
        return AssetMaintenanceResponse.builder()
                .maintenanceId(entity.getId())
                .assetId(entity.getAssetId())
                .maintenanceType(entity.getMaintenanceType())
                .performedAt(entity.getPerformedAt())
                .performedBy(entity.getPerformedBy())
                .notes(entity.getNotes())
                .nextDueAt(entity.getNextDueAt())
                .costAmount(entity.getCostAmount())
                .build();
    }
}
