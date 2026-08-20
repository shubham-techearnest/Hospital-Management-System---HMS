package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class DuplicateCandidateResponse {
    UUID patientId;
    String uhid;
    String legalName;
    String primaryPhone;
    LocalDate dateOfBirth;
    double matchScore;
    String matchReason;
}
