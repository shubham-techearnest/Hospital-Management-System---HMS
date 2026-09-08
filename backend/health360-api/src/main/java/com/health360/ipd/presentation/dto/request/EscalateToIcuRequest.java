package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class EscalateToIcuRequest {

    @NotNull
    private UUID icuBedId;

    private UUID primaryDoctorId;

    @Size(max = 2000)
    private String reason;
}
