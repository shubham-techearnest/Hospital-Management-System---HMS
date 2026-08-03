package com.health360.scheduling.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class RescheduleAppointmentRequest {

    @NotNull
    private UUID newSlotId;
}
