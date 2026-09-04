package com.health360.billing.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class SaasPaymentIntentResponse {
    UUID saasInvoiceId;
    UUID hospitalId;
    UUID planId;
    String invoiceNumber;
    BigDecimal amount;
    String currency;
    String status;
    String paymentStatus;
    String gatewayOrderId;
    String razorpayKeyId;
    boolean sandbox;
    LocalDate billingPeriodStart;
    LocalDate billingPeriodEnd;
    Instant createdAt;
}
