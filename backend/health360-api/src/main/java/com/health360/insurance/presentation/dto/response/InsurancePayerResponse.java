package com.health360.insurance.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class InsurancePayerResponse {
    UUID payerId;
    UUID hospitalId;
    String code;
    String name;
    String payerType;
    String contactPhone;
    String contactEmail;
    boolean active;
    String notes;
}
