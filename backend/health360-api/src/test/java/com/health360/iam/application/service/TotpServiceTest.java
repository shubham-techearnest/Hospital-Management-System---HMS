package com.health360.iam.application.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TotpServiceTest {

    private final TotpService totpService = new TotpService();

    @Test
    void generateAndVerifyCurrentCode() {
        String secret = totpService.generateSecret();
        long counter = System.currentTimeMillis() / 1000 / 30;
        String code = totpService.generateCode(secret, counter);
        assertTrue(totpService.verifyCode(secret, code));
        assertFalse(totpService.verifyCode(secret, "000000"));
    }

    @Test
    void otpAuthUriContainsSecret() {
        String secret = totpService.generateSecret();
        String uri = totpService.buildOtpAuthUri("Health360", "user@test.com", secret);
        assertTrue(uri.startsWith("otpauth://totp/"));
        assertTrue(uri.contains(secret));
    }
}
