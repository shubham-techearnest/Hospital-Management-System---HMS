package com.health360.billing.application.gateway;

import java.math.BigDecimal;

public record GatewayOrderRequest(
        String receipt,
        BigDecimal amount,
        String currency,
        String notes
) {}
