package com.health360.opd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class WalkInRegistrationRequest {

    /** Internal patient profile UUID (preferred when known). */
    private UUID patientId;

    /** Tenant UHID e.g. H360-2026-00000001 — resolved to patientId server-side. */
    @Size(max = 40)
    private String patientUhid;

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
