package com.health360.opd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PatientOpdVisitStatusResponse {
    UUID queueEntryId;
    String tokenDisplay;
    int tokenNumber;
    Integer queuePosition;
    String status;
    UUID hospitalId;
    UUID branchId;
    UUID encounterId;
    String encounterStatus;
    UUID primaryDoctorId;
    Instant checkedInAt;
    Instant calledAt;
    Instant serviceStartedAt;
    Instant completedAt;
}
