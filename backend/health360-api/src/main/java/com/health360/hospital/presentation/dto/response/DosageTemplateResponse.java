package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class DosageTemplateResponse {
    UUID dosageTemplateId;
    UUID hospitalId;
    UUID branchId;
    String label;
    String doseText;
    String route;
    String frequency;
    Integer durationDays;
    boolean active;
}
