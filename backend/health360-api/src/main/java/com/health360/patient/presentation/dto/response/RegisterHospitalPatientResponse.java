package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class RegisterHospitalPatientResponse {
    UUID patientId;
    String uhid;
    UUID hospitalRegistrationId;
    String receiptPath;
}
