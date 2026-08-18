package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class EncounterResponse {
    UUID encounterId;
    String encounterNumber;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    UUID departmentId;
    UUID primaryDoctorId;
    UUID appointmentId;
    String encounterType;
    String status;
    String visitReason;
    Instant startedAt;
    Instant endedAt;
    Instant createdAt;
    Instant updatedAt;
}
