package com.health360.icu.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IcuEquipmentAssignmentResponse {
    UUID assignmentId;
    UUID equipmentId;
    UUID stayId;
    String equipmentCode;
    String equipmentName;
    Instant assignedAt;
    Instant releasedAt;
    boolean active;
    String notes;
}
