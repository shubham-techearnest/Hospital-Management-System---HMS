package com.health360.billing.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PaymentResponse {
    UUID paymentId;
    UUID invoiceId;
    BigDecimal amount;
    String currency;
    String status;
    String gateway;
    String paymentMethod;
    Instant paidAt;
    String notes;
}
