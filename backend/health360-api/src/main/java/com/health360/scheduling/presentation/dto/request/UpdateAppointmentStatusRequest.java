package com.health360.scheduling.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAppointmentStatusRequest {

    @NotBlank
    @Pattern(regexp = "COMPLETED|NO_SHOW")
    private String status;
}
