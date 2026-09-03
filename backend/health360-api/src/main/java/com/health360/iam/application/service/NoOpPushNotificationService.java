package com.health360.iam.application.service;

import com.health360.iam.domain.NotificationType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "health360.push.enabled", havingValue = "false")
public class NoOpPushNotificationService implements PushNotificationService {

    @Override
    public void sendToUser(
            UUID userId, NotificationType type, String title, String body, Map<String, String> data) {
        // disabled
    }
}
