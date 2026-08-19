package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class LabResultResponse {
    UUID resultId;
    UUID labOrderId;
    UUID parameterId;
    String parameterCode;
    String parameterName;
    String valueText;
    BigDecimal valueNumeric;
    String unit;
    String referenceRange;
    String status;
    Instant recordedAt;
}
