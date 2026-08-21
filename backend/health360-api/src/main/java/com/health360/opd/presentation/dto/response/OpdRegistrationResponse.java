package com.health360.opd.presentation.dto.response;

import com.health360.clinical.presentation.dto.response.EncounterResponse;
import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class OpdRegistrationResponse {
    OpdQueueEntryResponse queueEntry;
    EncounterResponse encounter;
    UUID appointmentId;
    String appointmentStatus;
}
