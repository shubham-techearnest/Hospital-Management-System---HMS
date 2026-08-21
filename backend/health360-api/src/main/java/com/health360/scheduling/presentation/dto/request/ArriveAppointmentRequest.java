package com.health360.scheduling.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ArriveAppointmentRequest {
    private UUID deskId;
    private Integer priority;
}
