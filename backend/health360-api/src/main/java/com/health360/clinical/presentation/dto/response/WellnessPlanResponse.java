package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class WellnessPlanResponse {
    UUID wellnessPlanId;
    UUID encounterId;
    UUID patientId;
    String diet;
    String restGuidance;
    String exercise;
    String lifestyle;
    String notes;
    LocalDate followUpDate;
    String followUpReason;
    String followUpStatus;
    UUID followUpId;
    Instant updatedAt;
}
