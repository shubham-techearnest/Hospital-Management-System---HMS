package com.health360.icu.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateIcuStayRequest {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID bedId;

    private UUID primaryDoctorId;

    private UUID ipdAdmissionId;

    @Size(max = 2000)
    private String admissionReason;
}
