package com.health360.scheduling.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelAppointmentRequest {

    @Size(max = 500)
    private String reason;
}
