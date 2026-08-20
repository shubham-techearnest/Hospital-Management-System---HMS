package com.health360.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Production CORS for the hosted web app (Hostinger, etc.).
 * Allowed origins come from {@code APP_BASE_URL} plus optional {@code CORS_ALLOWED_ORIGINS}.
 */
@Configuration
@Profile("production")
@RequiredArgsConstructor
@Slf4j
public class ProductionCorsConfig {

    private static final List<String> ALLOWED_METHODS = List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
    );

    private static final List<String> ALLOWED_HEADERS = List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Correlation-Id",
            "X-Refresh-Token"
    );

    private final Health360Properties properties;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = resolveAllowedOrigins();
        log.info("Production CORS allowed origins: {}", origins);

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(ALLOWED_METHODS);
        configuration.setAllowedHeaders(ALLOWED_HEADERS);
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    List<String> resolveAllowedOrigins() {
        LinkedHashSet<String> origins = new LinkedHashSet<>();
        addOriginAndWwwVariant(origins, properties.getAppBaseUrl());
        String extra = properties.getCorsAllowedOrigins();
        if (StringUtils.hasText(extra)) {
            for (String part : extra.split(",")) {
                addOriginAndWwwVariant(origins, part);
            }
        }
        return List.copyOf(origins);
    }

    static void addOriginAndWwwVariant(Set<String> origins, String raw) {
        if (!StringUtils.hasText(raw)) {
            return;
        }
        String origin = raw.trim();
        if (origin.endsWith("/")) {
            origin = origin.substring(0, origin.length() - 1);
        }
        origins.add(origin);
        if (origin.startsWith("https://www.")) {
            origins.add("https://" + origin.substring("https://www.".length()));
        } else if (origin.startsWith("https://")) {
            origins.add("https://www." + origin.substring("https://".length()));
        }
    }
}
