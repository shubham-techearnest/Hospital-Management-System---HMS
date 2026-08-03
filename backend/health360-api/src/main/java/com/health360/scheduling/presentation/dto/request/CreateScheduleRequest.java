package com.health360.scheduling.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreateScheduleRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @Min(5) @Max(120)
    private int slotDurationMinutes = 15;

    @Min(0) @Max(60)
    private int bufferMinutes = 5;

    @Min(1) @Max(90)
    private int horizonDays = 30;

    @NotEmpty
    @Valid
    private List<ScheduleBlockRequest> scheduleBlocks;

    @Data
    public static class ScheduleBlockRequest {
        @NotNull
        private String dayOfWeek;

        @NotNull
        private LocalTime startTime;

        @NotNull
        private LocalTime endTime;

        @NotNull
        private String consultationType;

        private boolean active = true;
    }
}
