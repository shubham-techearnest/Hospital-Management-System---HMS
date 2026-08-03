package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class ScheduleResponse {
    UUID id;
    UUID hospitalId;
    UUID branchId;
    int slotDurationMinutes;
    int bufferMinutes;
    int horizonDays;
    boolean active;
    List<ScheduleBlockResponse> scheduleBlocks;

    @Value
    @Builder
    public static class ScheduleBlockResponse {
        UUID id;
        String dayOfWeek;
        LocalTime startTime;
        LocalTime endTime;
        String consultationType;
        boolean active;
    }
}
