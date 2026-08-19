package com.health360.laboratory.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateLabOrderRequest {

    @NotNull
    private UUID clinicalOrderItemId;
}
