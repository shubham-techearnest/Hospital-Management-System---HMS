package com.health360.procurement.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class PostGoodsReceiptPayload {

    @NotNull
    private UUID purchaseOrderId;

    @NotNull
    private UUID locationId;

    private String notes;

    @NotEmpty
    @Valid
    private List<PostGoodsReceiptLinePayload> lines;
}
