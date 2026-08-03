package com.health360.iam.application.service;

public interface EmailNotificationService {

    void sendVerificationEmail(String email, String firstName, String rawToken);

    void sendTransactionalEmail(String email, String subject, String body);
}
