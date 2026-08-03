package com.health360.location.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.location.domain.GeoUtils;
import com.health360.location.presentation.dto.response.DistanceResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TravelTimeService {

    private static final String PREFIX = "location:distance:";
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, CacheEntry> inMemoryCache = new ConcurrentHashMap<>();

    public TravelTimeService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public DistanceResponse calculateDistance(
            double originLat, double originLng, double destLat, double destLng) {
        String cacheKey = cacheKey(originLat, originLng, destLat, destLng);

        DistanceResponse cached = getCached(cacheKey);
        if (cached != null) {
            return cached;
        }

        BigDecimal distanceKm = GeoUtils.distanceKmRounded(originLat, originLng, destLat, destLng);
        int travelTimeMinutes = estimateTravelTimeMinutes(distanceKm.doubleValue());
        DistanceResponse response = DistanceResponse.builder()
                .distanceKm(distanceKm)
                .travelTimeMinutes(travelTimeMinutes)
                .build();

        putCached(cacheKey, response);
        return response;
    }

    private int estimateTravelTimeMinutes(double distanceKm) {
        return Math.max(5, (int) Math.round(distanceKm * 2.5));
    }

    private String cacheKey(double originLat, double originLng, double destLat, double destLng) {
        return String.format("%.4f,%.4f:%.4f,%.4f", originLat, originLng, destLat, destLng);
    }

    private DistanceResponse getCached(String key) {
        if (redisTemplate != null) {
            try {
                String json = redisTemplate.opsForValue().get(PREFIX + key);
                if (json != null) {
                    return objectMapper.readValue(json, DistanceResponse.class);
                }
            } catch (Exception ex) {
                log.warn("Redis unavailable for travel time cache; using in-memory fallback");
            }
        }
        CacheEntry entry = inMemoryCache.get(key);
        if (entry != null) {
            if (entry.expiresAtMs > System.currentTimeMillis()) {
                return entry.response;
            }
            inMemoryCache.remove(key);
        }
        return null;
    }

    private void putCached(String key, DistanceResponse response) {
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(
                        PREFIX + key, objectMapper.writeValueAsString(response), CACHE_TTL);
                return;
            } catch (JsonProcessingException ex) {
                log.warn("Unable to serialize distance response for cache");
            } catch (Exception ex) {
                log.warn("Redis unavailable for travel time cache; using in-memory fallback");
            }
        }
        inMemoryCache.put(key, new CacheEntry(
                response, System.currentTimeMillis() + CACHE_TTL.toMillis()));
    }

    private record CacheEntry(DistanceResponse response, long expiresAtMs) {
    }
}
