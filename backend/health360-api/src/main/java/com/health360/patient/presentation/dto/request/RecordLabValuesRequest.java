package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class RecordLabValuesRequest {

    private BigDecimal hba1c;
    private BigDecimal totalCholesterol;
    private BigDecimal hdl;
    private BigDecimal ldl;
    private BigDecimal triglycerides;
    private BigDecimal hemoglobin;
    private BigDecimal vitaminD;
    private BigDecimal tsh;
    private BigDecimal creatinine;

    @NotNull
    private Instant recordedAt;
}
