package com.health360.procurement.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreatePurchaseOrderPayload {

    @NotNull
    private UUID purchaseRequestId;

    private String vendorName;

    private String notes;
}
