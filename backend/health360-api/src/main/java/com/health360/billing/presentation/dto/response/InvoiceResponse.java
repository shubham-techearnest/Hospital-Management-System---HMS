package com.health360.billing.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class InvoiceResponse {
    UUID invoiceId;
    String invoiceNumber;
    UUID encounterId;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    String status;
    String currency;
    BigDecimal subtotalAmount;
    BigDecimal taxAmount;
    BigDecimal totalAmount;
    BigDecimal amountPaid;
    Instant issuedAt;
    Instant paidAt;
    String notes;
    List<InvoiceLineItemResponse> lineItems;
}
