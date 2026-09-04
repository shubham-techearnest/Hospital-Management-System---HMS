package com.health360.billing.application.gateway;

public record GatewayOrderResult(
        String orderId,
        long amountPaise,
        String currency,
        String status,
        boolean sandbox
) {}
