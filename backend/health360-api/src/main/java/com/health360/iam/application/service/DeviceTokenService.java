package com.health360.iam.application.service;

import com.health360.iam.infrastructure.persistence.entity.DeviceTokenEntity;
import com.health360.iam.infrastructure.persistence.repository.DeviceTokenRepository;
import com.health360.iam.presentation.dto.request.RegisterDeviceTokenRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;

    @Transactional
    public void register(UUID userId, UUID tenantId, RegisterDeviceTokenRequest request) {
        DeviceTokenEntity entity = deviceTokenRepository
                .findByExpoPushToken(request.expoPushToken())
                .orElseGet(DeviceTokenEntity::new);

        entity.setTenantId(tenantId);
        entity.setUserId(userId);
        entity.setExpoPushToken(request.expoPushToken());
        entity.setPlatform(request.platform());
        entity.setDeviceId(request.deviceId());
        entity.setDeletedAt(null);
        entity.setLastUsedAt(Instant.now());
        entity.touch();
        deviceTokenRepository.save(entity);
    }

    @Transactional
    public void unregister(UUID userId, String expoPushToken) {
        deviceTokenRepository.findByExpoPushTokenAndDeletedAtIsNull(expoPushToken).ifPresent(token -> {
            if (token.getUserId().equals(userId)) {
                token.setDeletedAt(Instant.now());
                token.touch();
                deviceTokenRepository.save(token);
            }
        });
    }

    @Transactional
    public void markInvalid(String expoPushToken) {
        deviceTokenRepository.findByExpoPushTokenAndDeletedAtIsNull(expoPushToken).ifPresent(token -> {
            token.setDeletedAt(Instant.now());
            token.touch();
            deviceTokenRepository.save(token);
        });
    }
}
