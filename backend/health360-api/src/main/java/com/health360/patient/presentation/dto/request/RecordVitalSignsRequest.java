package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class RecordVitalSignsRequest {

    @Min(40) @Max(300)
    private Integer systolicBp;

    @Min(20) @Max(200)
    private Integer diastolicBp;

    @Min(20) @Max(300)
    private Integer heartRate;

    @DecimalMin("30") @DecimalMax("45")
    private BigDecimal temperature;

    private Integer respiratoryRate;

    @Min(50) @Max(100)
    private Integer spo2;

    @DecimalMin("20") @DecimalMax("600")
    private BigDecimal bloodGlucose;

    private String glucoseReadingType;

    @NotNull
    private Instant recordedAt;
}
