package com.health360.clinical.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateEncounterRequest {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    private UUID departmentId;

    private UUID primaryDoctorId;

    private UUID appointmentId;

    @NotBlank
    @Size(max = 30)
    private String encounterType;

    @Size(max = 2000)
    private String visitReason;
}
