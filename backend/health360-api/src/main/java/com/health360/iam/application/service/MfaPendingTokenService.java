package com.health360.iam.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class MfaPendingTokenService {

    private static final String PREFIX = "mfa:pending:";
    private static final Duration TTL = Duration.ofMinutes(5);

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, Entry> inMemory = new ConcurrentHashMap<>();

    public MfaPendingTokenService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String issue(UUID userId, String deviceInfo) {
        String token = UUID.randomUUID().toString().replace("-", "");
        String value = userId + "|" + (deviceInfo == null ? "" : deviceInfo);
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(PREFIX + token, value, TTL);
                return token;
            } catch (Exception ex) {
                log.warn("Redis unavailable for MFA pending token; using in-memory fallback");
            }
        }
        inMemory.put(token, new Entry(value, System.currentTimeMillis() + TTL.toMillis()));
        return token;
    }

    public PendingMfa consume(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String value = null;
        if (redisTemplate != null) {
            try {
                value = redisTemplate.opsForValue().get(PREFIX + token);
                if (value != null) {
                    redisTemplate.delete(PREFIX + token);
                }
            } catch (Exception ex) {
                log.warn("Redis unavailable consuming MFA token; using in-memory fallback");
            }
        }
        if (value == null) {
            Entry entry = inMemory.remove(token);
            if (entry != null && entry.expiresAt > System.currentTimeMillis()) {
                value = entry.value;
            }
        }
        if (value == null) {
            return null;
        }
        int sep = value.indexOf('|');
        UUID userId = UUID.fromString(sep >= 0 ? value.substring(0, sep) : value);
        String deviceInfo = sep >= 0 && sep + 1 < value.length() ? value.substring(sep + 1) : null;
        return new PendingMfa(userId, deviceInfo);
    }

    public record PendingMfa(UUID userId, String deviceInfo) {}

    private record Entry(String value, long expiresAt) {}
}
