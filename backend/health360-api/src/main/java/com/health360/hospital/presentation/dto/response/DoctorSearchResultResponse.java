package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class DoctorSearchResultResponse {
    UUID doctorId;
    String doctorName;
    String medicalRegistrationNumber;
    String primarySpecialization;
    String verificationStatus;
}
