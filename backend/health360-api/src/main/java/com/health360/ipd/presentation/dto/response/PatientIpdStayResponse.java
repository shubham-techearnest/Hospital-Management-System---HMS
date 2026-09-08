package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PatientIpdStayResponse {
    UUID admissionId;
    UUID encounterId;
    String encounterNumber;
    String admissionNumber;
    UUID hospitalId;
    UUID branchId;
    String status;
    Instant admittedAt;
    Instant dischargedAt;
    Instant closedAt;
    UUID followUpAppointmentId;
    String dischargeType;
    String summaryText;
    String followUpPlan;
    String diagnosisText;
    String medicationsText;
    String adviceText;
}
