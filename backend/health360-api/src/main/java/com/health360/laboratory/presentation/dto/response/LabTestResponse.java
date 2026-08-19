package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class LabTestResponse {
    UUID labTestId;
    UUID laboratoryId;
    String code;
    String name;
    String specimenType;
    boolean active;
}
