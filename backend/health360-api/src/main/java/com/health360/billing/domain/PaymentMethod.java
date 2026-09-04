package com.health360.billing.domain;

public enum PaymentMethod {
    CASH,
    CARD,
    UPI,
    /** Gateway / Razorpay Checkout */
    ONLINE,
    OTHER
}
