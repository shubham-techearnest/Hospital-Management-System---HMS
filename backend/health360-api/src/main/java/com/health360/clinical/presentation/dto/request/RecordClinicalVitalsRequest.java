package com.health360.clinical.presentation.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class RecordClinicalVitalsRequest {

    @Min(40) @Max(300)
    private Integer systolicBp;

    @Min(20) @Max(200)
    private Integer diastolicBp;

    @Min(20) @Max(300)
    private Integer heartRate;

    @DecimalMin("30") @DecimalMax("45")
    private BigDecimal temperature;

    @Min(1) @Max(100)
    private Integer respiratoryRate;

    @Min(50) @Max(100)
    private Integer spo2;

    @DecimalMin("20") @DecimalMax("600")
    private BigDecimal bloodGlucose;

    @Size(max = 20)
    private String glucoseReadingType;

    @Size(max = 500)
    private String notes;

    @NotNull
    private Instant recordedAt;
}
