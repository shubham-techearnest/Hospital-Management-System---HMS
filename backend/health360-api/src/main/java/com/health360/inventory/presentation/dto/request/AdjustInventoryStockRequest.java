package com.health360.inventory.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AdjustInventoryStockRequest {

    @NotNull
    private UUID balanceId;

    /** Signed delta (+/-). */
    @NotNull
    private Integer quantityDelta;

    @Size(max = 500)
    private String notes;
}
