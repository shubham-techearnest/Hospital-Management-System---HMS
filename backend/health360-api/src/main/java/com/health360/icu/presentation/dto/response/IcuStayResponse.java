package com.health360.icu.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IcuStayResponse {
    UUID stayId;
    UUID encounterId;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    UUID primaryDoctorId;
    UUID ipdAdmissionId;
    UUID bedId;
    String stayNumber;
    String admissionReason;
    String status;
    String encounterStatus;
    Instant admittedAt;
    Instant dischargedAt;
}
