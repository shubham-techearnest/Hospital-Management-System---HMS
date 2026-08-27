package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class PharmacyRequestItemResponse {
    UUID itemId;
    UUID prescriptionItemId;
    UUID medicineId;
    String medicineName;
    Integer quantityRequested;
    Integer quantityDispensed;
    String availabilityStatus;
    String notes;
}
