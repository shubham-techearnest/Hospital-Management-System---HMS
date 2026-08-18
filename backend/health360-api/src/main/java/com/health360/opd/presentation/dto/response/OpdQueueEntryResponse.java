package com.health360.opd.presentation.dto.response;

import com.health360.clinical.presentation.dto.response.EncounterResponse;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class OpdQueueEntryResponse {
    UUID queueEntryId;
    UUID encounterId;
    UUID hospitalId;
    UUID branchId;
    UUID deskId;
    UUID appointmentId;
    UUID patientId;
    UUID primaryDoctorId;
    String registrationType;
    String tokenDisplay;
    int tokenNumber;
    LocalDate queueDate;
    String status;
    int priority;
    Instant checkedInAt;
    Instant calledAt;
    Instant serviceStartedAt;
    Instant completedAt;
    String encounterNumber;
    String encounterStatus;
    EncounterResponse encounter;
}
