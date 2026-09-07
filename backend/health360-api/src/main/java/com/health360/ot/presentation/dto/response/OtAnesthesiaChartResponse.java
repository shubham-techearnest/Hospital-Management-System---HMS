package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class OtAnesthesiaChartResponse {
    UUID chartId;
    UUID procedureId;
    String asaClass;
    String anesthesiaType;
    String inductionAgent;
    String airwayDevice;
    Instant startedAt;
    Instant endedAt;
    String complications;
    String notes;
    List<OtAnesthesiaEventResponse> events;
}
