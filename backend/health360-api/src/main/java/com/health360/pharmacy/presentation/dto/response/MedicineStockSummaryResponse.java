package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class MedicineStockSummaryResponse {
    UUID medicineId;
    String medicineName;
    String medicineCode;
    int quantityOnHand;
    List<MedicineBatchResponse> batches;
}
