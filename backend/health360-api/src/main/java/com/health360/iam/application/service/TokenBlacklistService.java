package com.health360.iam.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TokenBlacklistService {

    private static final String PREFIX = "jwt:blacklist:";

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, Long> inMemoryBlacklist = new ConcurrentHashMap<>();

    public TokenBlacklistService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blacklist(String jti, long ttlSeconds) {
        if (ttlSeconds <= 0) {
            return;
        }
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(PREFIX + jti, "1", Duration.ofSeconds(ttlSeconds));
                return;
            } catch (Exception ex) {
                log.warn("Redis unavailable for token blacklist; using in-memory fallback");
            }
        }
        inMemoryBlacklist.put(jti, System.currentTimeMillis() + ttlSeconds * 1000);
    }

    public boolean isBlacklisted(String jti) {
        if (redisTemplate != null) {
            try {
                if (Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + jti))) {
                    return true;
                }
            } catch (Exception ex) {
                log.warn("Redis unavailable checking blacklist; using in-memory fallback");
            }
        }
        Long expiry = inMemoryBlacklist.get(jti);
        if (expiry != null) {
            if (expiry > System.currentTimeMillis()) {
                return true;
            }
            inMemoryBlacklist.remove(jti);
        }
        return false;
    }
}
