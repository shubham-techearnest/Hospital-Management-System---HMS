package com.health360.billing.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class InvoiceLineItemResponse {
    UUID lineItemId;
    String description;
    BigDecimal quantity;
    BigDecimal unitPrice;
    BigDecimal lineTotal;
    String sourceType;
    UUID sourceId;
}
