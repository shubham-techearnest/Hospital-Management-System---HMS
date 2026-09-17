package com.health360.asset.application.service;

import com.health360.asset.infrastructure.persistence.entity.AssetCategoryEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceLogEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceScheduleEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceTicketEntity;
import com.health360.asset.presentation.dto.response.AssetCategoryResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceScheduleResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceTicketResponse;
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
                .purchaseCost(entity.getPurchaseCost())
                .supplierName(entity.getSupplierName())
                .warrantyExpiry(entity.getWarrantyExpiry())
                .amcExpiry(entity.getAmcExpiry())
                .locationLabel(entity.getLocationLabel())
                .status(entity.getStatus())
                .criticality(entity.getCriticality())
                .qrPayload(entity.getQrPayload())
                .nextPmAt(entity.getNextPmAt())
                .nextCalibrationAt(entity.getNextCalibrationAt())
                .commissionedAt(entity.getCommissionedAt())
                .parentAssetId(entity.getParentAssetId())
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

    public AssetMaintenanceTicketResponse toTicketResponse(AssetMaintenanceTicketEntity entity) {
        return AssetMaintenanceTicketResponse.builder()
                .ticketId(entity.getId())
                .assetId(entity.getAssetId())
                .scheduleId(entity.getScheduleId())
                .ticketNumber(entity.getTicketNumber())
                .ticketType(entity.getTicketType())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .reportedBy(entity.getReportedBy())
                .assignedRole(entity.getAssignedRole())
                .openedAt(entity.getOpenedAt())
                .completedAt(entity.getCompletedAt())
                .completedBy(entity.getCompletedBy())
                .resolutionNotes(entity.getResolutionNotes())
                .build();
    }

    public AssetMaintenanceScheduleResponse toScheduleResponse(AssetMaintenanceScheduleEntity entity) {
        return AssetMaintenanceScheduleResponse.builder()
                .scheduleId(entity.getId())
                .assetId(entity.getAssetId())
                .scheduleType(entity.getScheduleType())
                .cadence(entity.getCadence())
                .intervalDays(entity.getIntervalDays())
                .nextDueAt(entity.getNextDueAt())
                .lastGeneratedAt(entity.getLastGeneratedAt())
                .active(entity.isActive())
                .notes(entity.getNotes())
                .build();
    }
}
