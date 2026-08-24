package com.health360.opd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AssignDoctorRequest {

    @NotNull
    private UUID primaryDoctorId;
}
