package com.health360.inventory.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ReceiveInventoryStockRequest {

    @NotNull
    private UUID itemId;

    @NotNull
    private UUID locationId;

    @NotNull
    @Min(1)
    private Integer quantity;

    @Size(max = 60)
    private String lotNumber;

    private LocalDate expiryDate;

    private BigDecimal unitCost;

    @Size(max = 500)
    private String notes;
}
