package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class ClinicalOrderResponse {
    UUID orderId;
    UUID encounterId;
    String orderNumber;
    String orderType;
    String status;
    String instructions;
    Instant orderedAt;
    List<OrderItemResponse> items;

    @Value
    @Builder
    public static class OrderItemResponse {
        UUID itemId;
        String itemCode;
        String itemName;
        UUID itemReferenceId;
        int quantity;
        String instructions;
        String status;
    }
}
