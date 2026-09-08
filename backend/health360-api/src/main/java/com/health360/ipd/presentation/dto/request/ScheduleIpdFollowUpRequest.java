package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class ScheduleIpdFollowUpRequest {

    @NotNull
    private UUID doctorId;

    @NotNull
    private UUID slotId;

    @Size(max = 500)
    private String reasonForVisit;
}
