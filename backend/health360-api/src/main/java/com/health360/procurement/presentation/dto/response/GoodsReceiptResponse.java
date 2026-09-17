package com.health360.procurement.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class GoodsReceiptResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID branchId;
    private UUID purchaseOrderId;
    private String grnNumber;
    private String status;
    private UUID locationId;
    private String notes;
    private Instant receivedAt;
    private UUID receivedBy;
    private Instant createdAt;
    private List<GoodsReceiptLineResponse> lines;
}
