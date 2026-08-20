package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class RegistrationReceiptResponse {
    UUID patientId;
    String uhid;
    String legalName;
    String primaryPhone;
    String hospitalName;
    UUID hospitalId;
    UUID branchId;
    Instant registeredAt;
    UUID hospitalRegistrationId;
}
