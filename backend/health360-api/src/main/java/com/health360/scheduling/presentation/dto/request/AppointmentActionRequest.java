package com.health360.scheduling.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentActionRequest {

    @Size(max = 1000)
    private String message;
}
