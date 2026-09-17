package com.health360.blood.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class BloodUnitResponse {
    UUID unitId;
    UUID hospitalId;
    UUID branchId;
    String unitNumber;
    String productType;
    String bloodGroup;
    String status;
    Instant collectedAt;
    Instant expiresAt;
    String donorRef;
    String notes;
}
