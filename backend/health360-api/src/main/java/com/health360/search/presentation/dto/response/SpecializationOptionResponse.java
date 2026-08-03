package com.health360.search.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class SpecializationOptionResponse {
    UUID id;
    String code;
    String name;
    String category;
}
