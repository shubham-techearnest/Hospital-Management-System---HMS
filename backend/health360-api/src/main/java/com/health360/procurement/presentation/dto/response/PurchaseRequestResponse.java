package com.health360.procurement.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class PurchaseRequestResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID branchId;
    private String requestNumber;
    private String status;
    private String title;
    private String notes;
    private BigDecimal totalAmount;
    private UUID requestedBy;
    private Instant submittedAt;
    private Instant decidedAt;
    private UUID decidedBy;
    private Instant createdAt;
    private List<PurchaseRequestLineResponse> lines;
}
