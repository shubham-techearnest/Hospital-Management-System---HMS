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
    String patientName;
    String uhid;
    UUID hospitalId;
    UUID branchId;
    UUID primaryDoctorId;
    UUID bedId;
    String wardCode;
    String roomCode;
    String bedNumber;
    String admissionNumber;
    String admissionReason;
    String status;
    String encounterStatus;
    Instant admittedAt;
    Instant dischargedAt;
}
