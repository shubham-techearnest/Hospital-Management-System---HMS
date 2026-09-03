package com.health360.iam.application.service;

import com.health360.iam.domain.NotificationType;

import java.util.Map;
import java.util.UUID;

public interface PushNotificationService {

    void sendToUser(UUID userId, NotificationType type, String title, String body, Map<String, String> data);
}
