package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ClinicalVitalSignResponse {
    UUID vitalSignId;
    UUID encounterId;
    Integer systolicBp;
    Integer diastolicBp;
    Integer heartRate;
    BigDecimal temperature;
    Integer respiratoryRate;
    Integer spo2;
    BigDecimal bloodGlucose;
    String glucoseReadingType;
    String notes;
    Instant recordedAt;
    String bpClassification;
    String bpInterpretation;
}
