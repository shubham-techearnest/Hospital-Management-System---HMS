package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReassignAttendingDoctorRequest {

    /** Attending / primary doctor for this IPD admission (doctor.doctor_profiles.id). */
    @NotNull
    private UUID primaryDoctorId;

    private String reason;
}
