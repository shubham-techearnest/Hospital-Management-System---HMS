package com.health360.iam.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.iam.domain.NotificationType;
import com.health360.iam.infrastructure.persistence.entity.DeviceTokenEntity;
import com.health360.iam.infrastructure.persistence.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "health360.push.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class ExpoPushNotificationService implements PushNotificationService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final DeviceTokenRepository deviceTokenRepository;
    private final DeviceTokenService deviceTokenService;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    @Override
    public void sendToUser(
            UUID userId, NotificationType type, String title, String body, Map<String, String> data) {
        List<DeviceTokenEntity> tokens = deviceTokenRepository.findByUserIdAndDeletedAtIsNull(userId);
        if (tokens.isEmpty()) {
            return;
        }

        List<Map<String, Object>> messages = new ArrayList<>();
        for (DeviceTokenEntity token : tokens) {
            Map<String, Object> message = new HashMap<>();
            message.put("to", token.getExpoPushToken());
            message.put("title", title);
            message.put("body", body);
            message.put("sound", "default");
            message.put("priority", "high");
            message.put("channelId", "opd-queue");

            Map<String, String> payload = new HashMap<>(data);
            payload.put("notificationType", type.name());
            message.put("data", payload);

            messages.add(message);
            token.setLastUsedAt(Instant.now());
        }
        deviceTokenRepository.saveAll(tokens);

        try {
            String responseBody = restClient.post()
                    .uri(EXPO_PUSH_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(messages)
                    .retrieve()
                    .body(String.class);

            handleExpoResponse(responseBody, tokens);
        } catch (Exception ex) {
            log.warn("Expo push delivery failed for user {}: {}", userId, ex.getMessage());
        }
    }

    private void handleExpoResponse(String responseBody, List<DeviceTokenEntity> tokens) throws Exception {
        if (responseBody == null || responseBody.isBlank()) {
            return;
        }
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode data = root.get("data");
        if (data == null || !data.isArray()) {
            return;
        }
        for (int i = 0; i < data.size() && i < tokens.size(); i++) {
            JsonNode item = data.get(i);
            if (!"error".equals(item.path("status").asText())) {
                continue;
            }
            String error = item.path("details").path("error").asText();
            if ("DeviceNotRegistered".equals(error) || "InvalidCredentials".equals(error)) {
                deviceTokenService.markInvalid(tokens.get(i).getExpoPushToken());
            }
        }
    }
}
