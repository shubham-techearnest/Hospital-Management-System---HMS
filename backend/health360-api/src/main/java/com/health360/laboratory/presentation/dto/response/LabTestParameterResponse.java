package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class LabTestParameterResponse {
    UUID parameterId;
    UUID labTestId;
    String code;
    String name;
    String unit;
    String referenceRange;
}
