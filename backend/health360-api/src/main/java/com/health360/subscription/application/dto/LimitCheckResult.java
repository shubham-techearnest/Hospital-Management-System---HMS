package com.health360.subscription.application.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class LimitCheckResult {
    boolean allowed;
    String limitKey;
    long used;
    long limit;
    long remaining;
    String message;

    public static LimitCheckResult allowed(String limitKey, long used, long limit) {
        return LimitCheckResult.builder()
                .allowed(true)
                .limitKey(limitKey)
                .used(used)
                .limit(limit)
                .remaining(Math.max(0, limit - used))
                .build();
    }

    public static LimitCheckResult denied(String limitKey, long used, long limit, String message) {
        return LimitCheckResult.builder()
                .allowed(false)
                .limitKey(limitKey)
                .used(used)
                .limit(limit)
                .remaining(0)
                .message(message)
                .build();
    }
}
