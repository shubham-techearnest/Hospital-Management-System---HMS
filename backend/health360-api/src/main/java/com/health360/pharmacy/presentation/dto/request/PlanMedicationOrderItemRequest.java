package com.health360.pharmacy.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlanMedicationOrderItemRequest {

    @Size(max = 100)
    private String doseText;

    @Size(max = 30)
    private String route;

    @Size(max = 100)
    private String frequency;

    private Integer durationDays;

    @Size(max = 2000)
    private String instructions;
}
