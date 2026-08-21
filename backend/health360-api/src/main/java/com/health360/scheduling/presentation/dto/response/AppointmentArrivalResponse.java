package com.health360.scheduling.presentation.dto.response;

import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.opd.presentation.dto.response.OpdQueueEntryResponse;
import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class AppointmentArrivalResponse {
    UUID appointmentId;
    String appointmentStatus;
    EncounterResponse encounter;
    OpdQueueEntryResponse queueEntry;
}
