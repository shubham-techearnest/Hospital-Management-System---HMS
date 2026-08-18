package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdAdmissionResponse {
    UUID admissionId;
    UUID encounterId;
    String encounterNumber;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    UUID primaryDoctorId;
    UUID bedId;
    String admissionNumber;
    String admissionReason;
    String status;
    String encounterStatus;
    Instant admittedAt;
    Instant dischargedAt;
}
