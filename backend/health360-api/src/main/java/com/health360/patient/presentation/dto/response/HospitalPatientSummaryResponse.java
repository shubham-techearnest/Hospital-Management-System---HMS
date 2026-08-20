package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class HospitalPatientSummaryResponse {
    UUID patientId;
    String uhid;
    String legalName;
    String primaryPhone;
    LocalDate dateOfBirth;
    String gender;
    String bloodGroup;
    String permanentCity;
    String permanentState;
}
