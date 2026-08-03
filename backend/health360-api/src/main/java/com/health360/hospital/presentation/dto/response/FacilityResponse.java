package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class FacilityResponse {
    UUID id;
    UUID branchId;
    String name;
    String category;
    String description;
    boolean available;
}
