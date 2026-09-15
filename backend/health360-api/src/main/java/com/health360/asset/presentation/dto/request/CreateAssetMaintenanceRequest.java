package com.health360.asset.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class CreateAssetMaintenanceRequest {

    @NotBlank
    private String maintenanceType;

    private Instant performedAt;

    @Size(max = 2000)
    private String notes;

    private Instant nextDueAt;

    private BigDecimal costAmount;
}
