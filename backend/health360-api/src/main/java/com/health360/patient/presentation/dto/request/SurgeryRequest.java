package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SurgeryRequest {

    @NotBlank
    @Size(max = 200)
    private String procedureName;

    private LocalDate surgeryDate;

    @Size(max = 200)
    private String hospitalName;

    private String notes;
}
