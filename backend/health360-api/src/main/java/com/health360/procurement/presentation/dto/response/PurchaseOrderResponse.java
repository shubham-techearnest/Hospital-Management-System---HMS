package com.health360.procurement.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class PurchaseOrderResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID branchId;
    private UUID purchaseRequestId;
    private String orderNumber;
    private String status;
    private String vendorName;
    private String notes;
    private BigDecimal totalAmount;
    private Instant issuedAt;
    private UUID issuedBy;
    private Instant createdAt;
    private List<PurchaseOrderLineResponse> lines;
}
