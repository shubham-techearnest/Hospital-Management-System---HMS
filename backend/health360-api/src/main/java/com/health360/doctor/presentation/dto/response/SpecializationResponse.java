package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class SpecializationResponse {
    UUID id;
    String code;
    String name;
}
