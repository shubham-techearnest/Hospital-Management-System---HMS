package com.health360.radiology.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class ImagingModalityResponse {
    UUID modalityId;
    UUID hospitalId;
    UUID branchId;
    String code;
    String name;
    String modalityType;
    boolean active;
}
