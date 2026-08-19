package com.health360.pharmacy.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdministerMedicationRequest {

    @NotBlank
    @Size(max = 100)
    private String doseGiven;

    @Size(max = 30)
    private String route;

    @Size(max = 2000)
    private String notes;
}
