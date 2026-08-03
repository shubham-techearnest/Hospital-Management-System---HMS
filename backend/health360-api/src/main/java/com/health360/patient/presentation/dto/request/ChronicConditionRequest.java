package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ChronicConditionRequest {

    @NotBlank
    @Size(max = 200)
    private String conditionName;

    private LocalDate diagnosedDate;

    @NotBlank
    @Size(max = 20)
    private String status;

    private String notes;
}
