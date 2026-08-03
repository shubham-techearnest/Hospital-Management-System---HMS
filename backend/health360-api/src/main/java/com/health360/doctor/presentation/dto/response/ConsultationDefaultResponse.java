package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.UUID;

@Value
@Builder
public class ConsultationDefaultResponse {
    UUID id;
    String consultationType;
    BigDecimal feeAmount;
    String currency;
    Integer durationMinutes;
    String feeDisplay;
}
