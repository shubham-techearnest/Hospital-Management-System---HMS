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

    /**
     * Attending / primary doctor responsible for IPD care and rounds
     * ({@code doctor.doctor_profiles.id}). Required for admit; may be pre-filled
     * from an admission request's attendingDoctorId.
     */
    private UUID primaryDoctorId;

    private String admissionReason;

    /** When set, admit from an APPROVED/SCHEDULED admission request. */
    private UUID admissionRequestId;

    private String admissionSource;

    private String admissionType;
}
