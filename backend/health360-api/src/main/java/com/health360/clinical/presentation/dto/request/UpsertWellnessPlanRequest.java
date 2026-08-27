package com.health360.clinical.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpsertWellnessPlanRequest {

    @Size(max = 4000)
    private String diet;

    @Size(max = 4000)
    private String restGuidance;

    @Size(max = 4000)
    private String exercise;

    @Size(max = 4000)
    private String lifestyle;

    @Size(max = 4000)
    private String notes;

    private LocalDate followUpDate;

    @Size(max = 1000)
    private String followUpReason;
}
