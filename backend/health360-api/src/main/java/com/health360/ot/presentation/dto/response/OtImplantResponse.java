package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class OtImplantResponse {
    UUID implantId;
    UUID procedureId;
    String implantName;
    String implantType;
    String manufacturer;
    String lotNumber;
    String serialNumber;
    Integer quantity;
    Instant implantedAt;
    String notes;
}
