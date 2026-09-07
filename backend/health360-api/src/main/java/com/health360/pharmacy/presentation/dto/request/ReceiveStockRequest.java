package com.health360.pharmacy.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ReceiveStockRequest {

    @NotNull
    private UUID medicineId;

    @NotBlank
    private String batchNumber;

    @NotNull
    @Min(1)
    private Integer quantity;

    private LocalDate expiryDate;

    private BigDecimal unitCost;

    private String notes;
}
