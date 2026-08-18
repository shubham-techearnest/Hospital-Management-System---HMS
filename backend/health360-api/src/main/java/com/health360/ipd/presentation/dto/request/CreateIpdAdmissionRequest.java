package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateIpdAdmissionRequest {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID bedId;

    private UUID primaryDoctorId;

    private String admissionReason;
}
