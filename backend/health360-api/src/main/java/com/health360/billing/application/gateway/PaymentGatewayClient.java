package com.health360.billing.application.gateway;

public interface PaymentGatewayClient {

    GatewayOrderResult createOrder(GatewayOrderRequest request);

    boolean verifyWebhookSignature(String payload, String signature);

    /** Public key id for Checkout.js (may be blank in pure local sandbox). */
    String getPublicKeyId();

    boolean isSandboxMode();
}
