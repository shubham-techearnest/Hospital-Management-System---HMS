package com.health360.opd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class WalkInRegistrationRequest {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    private UUID departmentId;

    private UUID primaryDoctorId;

    private UUID deskId;

    @Size(max = 2000)
    private String visitReason;

    private Integer priority;
}
