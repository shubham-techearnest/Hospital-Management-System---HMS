package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class DischargeIpdPatientRequest {

    @NotBlank
    private String summaryText;

    private String followUpPlan;

    /** ROUTINE | LAMA | DAMA | DEATH | TRANSFER_OUT | ABSCONDED */
    @Size(max = 30)
    private String dischargeType = "ROUTINE";

    @Size(max = 4000)
    private String diagnosisText;

    @Size(max = 4000)
    private String medicationsText;

    @Size(max = 4000)
    private String adviceText;

    // LAMA / DAMA
    @Size(max = 4000)
    private String leaveAgainstAdviceNotes;

    // Death
    private Instant pronouncedAt;
    @Size(max = 4000)
    private String causeOfDeath;
    @Size(max = 200)
    private String certifiedByName;
    private UUID certifiedById;
    @Size(max = 100)
    private String placeOfDeath;
    @Size(max = 4000)
    private String mortuaryNotes;

    // Transfer-out
    @Size(max = 300)
    private String destinationName;
    private UUID destinationHospitalId;
    @Size(max = 4000)
    private String transferReason;
    @Size(max = 200)
    private String acceptingPhysician;
    @Size(max = 50)
    private String transportMode;
}
