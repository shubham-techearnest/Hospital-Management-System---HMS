package com.health360.billing.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentIntentRequest {

    /** Optional partial amount; defaults to outstanding balance. */
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    /** Client idempotency key to avoid duplicate pending intents. */
    private String idempotencyKey;
}
