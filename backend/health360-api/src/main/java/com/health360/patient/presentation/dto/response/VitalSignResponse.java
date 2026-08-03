package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class VitalSignResponse {
    UUID id;
    Integer systolicBp;
    Integer diastolicBp;
    Integer heartRate;
    BigDecimal temperature;
    Integer respiratoryRate;
    Integer spo2;
    BigDecimal bloodGlucose;
    String glucoseReadingType;
    Instant recordedAt;
    String bpClassification;
    String bpInterpretation;
}
