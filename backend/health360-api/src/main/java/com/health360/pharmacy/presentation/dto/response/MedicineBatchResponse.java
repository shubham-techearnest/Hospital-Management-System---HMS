package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class MedicineBatchResponse {
    UUID batchId;
    UUID medicineId;
    String medicineName;
    String batchNumber;
    LocalDate expiryDate;
    Integer quantityOnHand;
    BigDecimal unitCost;
    Instant receivedAt;
}
