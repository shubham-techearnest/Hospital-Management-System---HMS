package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.iam.infrastructure.persistence.entity.RefreshTokenEntity;
import com.health360.iam.infrastructure.persistence.repository.RefreshTokenRepository;
import com.health360.shared.util.HashUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final Health360Properties properties;

    @Transactional
    public String issueRefreshToken(UUID userId, UUID tenantId, String deviceInfo) {
        String rawToken = HashUtils.newToken();
        RefreshTokenEntity entity = new RefreshTokenEntity();
        entity.setUserId(userId);
        entity.setTenantId(tenantId);
        entity.setTokenHash(HashUtils.sha256(rawToken));
        entity.setDeviceInfo(deviceInfo);
        entity.setExpiresAt(Instant.now().plusSeconds(properties.getJwt().getRefreshTokenTtlSeconds()));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    @Transactional(readOnly = true)
    public Optional<RefreshTokenEntity> findValidToken(String rawToken) {
        return refreshTokenRepository.findByTokenHashAndRevokedFalse(HashUtils.sha256(rawToken))
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()));
    }

    @Transactional
    public void revokeToken(String rawToken) {
        refreshTokenRepository.revokeByTokenHash(HashUtils.sha256(rawToken));
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public void rotateToken(RefreshTokenEntity existing) {
        existing.setRevoked(true);
        existing.setRevokedAt(Instant.now());
        refreshTokenRepository.save(existing);
    }
}
