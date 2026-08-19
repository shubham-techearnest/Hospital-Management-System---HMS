package com.health360.pharmacy.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateMedicationOrderRequest {

    @NotNull
    private UUID clinicalOrderId;
}
