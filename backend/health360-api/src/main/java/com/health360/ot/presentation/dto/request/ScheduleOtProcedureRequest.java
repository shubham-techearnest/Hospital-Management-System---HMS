package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ScheduleOtProcedureRequest {

    @NotNull
    private UUID theatreId;

    @NotNull
    private Instant scheduledStart;

    @NotNull
    private Instant scheduledEnd;

    @Size(max = 2000)
    private String notes;
}
