package com.health360.emergency.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class DisposeEdVisitRequest {

    @NotBlank
    @Size(max = 40)
    private String disposition;

    @Size(max = 4000)
    private String dispositionNotes;

    /** Required for ADMIT_IPD / ADMIT_ICU when creating stay via ADT. */
    private UUID bedId;

    /** Required for ADMIT_IPD (attending). Optional for ADMIT_ICU. */
    private UUID primaryDoctorId;

    /** Optional pre-created admission/stay id if ADT already ran client-side. */
    private UUID resultingAdmissionId;
}
