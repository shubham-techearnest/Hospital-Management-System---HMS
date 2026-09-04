package com.health360.billing.application.gateway;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RazorpayPaymentGatewayClientTest {

    @Test
    void toPaiseConvertsRupees() {
        assertEquals(50000L, RazorpayPaymentGatewayClient.toPaise(new BigDecimal("500.00")));
        assertEquals(199L, RazorpayPaymentGatewayClient.toPaise(new BigDecimal("1.99")));
    }
}
