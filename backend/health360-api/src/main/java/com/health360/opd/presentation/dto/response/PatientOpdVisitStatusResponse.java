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
    String hospitalName;
    UUID branchId;
    String branchName;
    UUID encounterId;
    String encounterNumber;
    String encounterStatus;
    UUID primaryDoctorId;
    String primaryDoctorName;
    Instant checkedInAt;
    Instant calledAt;
    Instant serviceStartedAt;
    Instant completedAt;
    String invoiceStatus;
}
