package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateOtProcedureRequest {

    @NotNull
    private UUID clinicalOrderItemId;
}
