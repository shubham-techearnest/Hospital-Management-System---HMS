package com.health360.asset.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateAssetRequest {

    private UUID categoryId;

    private UUID departmentId;

    @Size(max = 150)
    private String name;

    @Size(max = 40)
    private String assetTag;

    @Size(max = 80)
    private String serialNumber;

    @Size(max = 100)
    private String manufacturer;

    @Size(max = 100)
    private String model;

    private LocalDate purchaseDate;

    private LocalDate warrantyExpiry;

    @Size(max = 200)
    private String locationLabel;

    @Size(max = 2000)
    private String notes;
}
