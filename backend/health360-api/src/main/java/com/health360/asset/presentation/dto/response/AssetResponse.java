package com.health360.asset.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class AssetResponse {
    UUID assetId;
    UUID hospitalId;
    UUID branchId;
    UUID categoryId;
    String categoryCode;
    String categoryName;
    UUID departmentId;
    String name;
    String assetTag;
    String serialNumber;
    String manufacturer;
    String model;
    LocalDate purchaseDate;
    BigDecimal purchaseCost;
    String supplierName;
    LocalDate warrantyExpiry;
    LocalDate amcExpiry;
    String locationLabel;
    String status;
    String criticality;
    String qrPayload;
    Instant nextPmAt;
    Instant nextCalibrationAt;
    Instant commissionedAt;
    UUID parentAssetId;
    String notes;
    Instant updatedAt;
}
