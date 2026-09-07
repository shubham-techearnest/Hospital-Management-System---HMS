package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class OtAnesthesiaEventResponse {
    UUID eventId;
    UUID procedureId;
    UUID chartId;
    String eventType;
    Instant recordedAt;
    Integer systolicBp;
    Integer diastolicBp;
    Integer pulse;
    Integer spo2;
    String notes;
}
