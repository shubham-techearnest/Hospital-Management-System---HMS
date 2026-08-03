package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MedicationRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 100)
    private String dosage;

    @Size(max = 100)
    private String frequency;

    @Size(max = 50)
    private String route;

    private LocalDate startDate;
    private LocalDate endDate;

    @Size(max = 200)
    private String prescribingDoctor;
}
