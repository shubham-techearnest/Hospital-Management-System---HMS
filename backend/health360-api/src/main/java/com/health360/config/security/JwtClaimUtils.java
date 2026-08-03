package com.health360.config.security;

import io.jsonwebtoken.Claims;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

final class JwtClaimUtils {

    private JwtClaimUtils() {
    }

    static List<String> getStringList(Claims claims, String claimName) {
        Object raw = claims.get(claimName);
        if (raw == null) {
            return List.of();
        }
        if (raw instanceof Collection<?> collection) {
            List<String> values = new ArrayList<>(collection.size());
            for (Object item : collection) {
                if (item != null) {
                    values.add(String.valueOf(item));
                }
            }
            return values;
        }
        return List.of(String.valueOf(raw));
    }
}
