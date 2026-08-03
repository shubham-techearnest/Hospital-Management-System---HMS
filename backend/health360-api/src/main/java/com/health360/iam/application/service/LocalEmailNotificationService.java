package com.health360.iam.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class LocalEmailNotificationService implements EmailNotificationService {

    @Value("${health360.app-base-url:http://localhost:5173}")
    private String appBaseUrl;

    @Override
    public void sendVerificationEmail(String email, String firstName, String rawToken) {
        String link = appBaseUrl + "/verify-email?token=" + rawToken;
        log.info("""
                ===== VERIFICATION EMAIL (local dev) =====
                To: {}
                Hi {},
                Verify your email: {}
                ==========================================
                """, email, firstName, link);
    }

    @Override
    public void sendTransactionalEmail(String email, String subject, String body) {
        log.info("""
                ===== TRANSACTIONAL EMAIL (local dev) =====
                To: {}
                Subject: {}
                {}
                ===========================================
                """, email, subject, body);
    }
}
