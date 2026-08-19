package com.health360.icu.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IcuBedResponse {
    UUID bedId;
    UUID unitId;
    String unitCode;
    String bedNumber;
    String status;
}
