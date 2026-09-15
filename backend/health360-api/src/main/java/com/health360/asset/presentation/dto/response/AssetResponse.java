package com.health360.asset.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

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
    LocalDate warrantyExpiry;
    String locationLabel;
    String status;
    String notes;
    Instant updatedAt;
}
