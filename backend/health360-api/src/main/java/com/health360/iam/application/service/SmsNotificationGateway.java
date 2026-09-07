package com.health360.iam.application.service;

/**
 * G1 SMS gateway abstraction. Implementations: logging stub (default) or vendor adapter when keys are set.
 */
public interface SmsNotificationGateway {

    /**
     * @return true if a send was attempted (or logged); false if skipped (disabled / blank phone)
     */
    boolean send(String phoneE164, String message);
}
