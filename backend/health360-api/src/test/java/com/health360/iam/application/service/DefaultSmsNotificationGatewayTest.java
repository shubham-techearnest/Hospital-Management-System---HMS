package com.health360.iam.application.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DefaultSmsNotificationGatewayTest {

    @Test
    void normalizeAddsIndiaCountryCodeForTenDigit() {
        assertEquals("919876543210", DefaultSmsNotificationGateway.normalizeIndianMobile("9876543210"));
        assertEquals("919876543210", DefaultSmsNotificationGateway.normalizeIndianMobile("+91 98765-43210"));
        assertEquals("919876543210", DefaultSmsNotificationGateway.normalizeIndianMobile("919876543210"));
    }
}
