package com.health360.radiology.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateImagingOrderRequest {

    @NotNull
    private UUID clinicalOrderItemId;
}
