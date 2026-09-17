package com.health360.asset.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateAssetRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID categoryId;

    private UUID departmentId;

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotBlank
    @Size(max = 40)
    private String assetTag;

    @Size(max = 80)
    private String serialNumber;

    @Size(max = 100)
    private String manufacturer;

    @Size(max = 100)
    private String model;

    private LocalDate purchaseDate;

    private BigDecimal purchaseCost;

    @Size(max = 200)
    private String supplierName;

    private LocalDate warrantyExpiry;

    private LocalDate amcExpiry;

    @Size(max = 200)
    private String locationLabel;

    @Size(max = 20)
    private String criticality;

    @Size(max = 2000)
    private String notes;
}
