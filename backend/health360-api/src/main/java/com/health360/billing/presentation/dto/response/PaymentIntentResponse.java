package com.health360.billing.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.UUID;

@Value
@Builder
public class PaymentIntentResponse {
    UUID paymentId;
    UUID invoiceId;
    BigDecimal amount;
    String currency;
    String status;
    String gateway;
    String gatewayOrderId;
    String razorpayKeyId;
    boolean sandbox;
    String description;
}
