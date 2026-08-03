package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class LabValueResponse {
    UUID id;
    BigDecimal hba1c;
    BigDecimal totalCholesterol;
    BigDecimal hdl;
    BigDecimal ldl;
    BigDecimal triglycerides;
    BigDecimal hemoglobin;
    BigDecimal vitaminD;
    BigDecimal tsh;
    BigDecimal creatinine;
    Instant recordedAt;
}
