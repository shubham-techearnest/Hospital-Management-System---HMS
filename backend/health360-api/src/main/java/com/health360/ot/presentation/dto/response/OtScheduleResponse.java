package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class OtScheduleResponse {
    UUID scheduleId;
    UUID theatreId;
    Instant scheduledStart;
    Instant scheduledEnd;
    String status;
}
