package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class UpdatePhysicalMeasurementsRequest {

    @DecimalMin("30")
    @DecimalMax("300")
    private BigDecimal heightCm;

    @DecimalMin("1")
    @DecimalMax("500")
    private BigDecimal weightKg;

    private BigDecimal waistCm;
    private BigDecimal hipCm;
    private BigDecimal neckCm;
    private BigDecimal bodyFatPercent;

    @NotNull
    private Instant measuredAt;
}
