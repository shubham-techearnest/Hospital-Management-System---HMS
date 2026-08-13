package com.health360.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes Render/Heroku-style {@code DATABASE_URL} values
 * ({@code postgresql://user:pass@host/db}) into Spring JDBC properties.
 */
public class DatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String RENDER_DATABASE = "renderDatabaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> overrides = new HashMap<>();

        applyIfPresent(environment, overrides, "DATABASE_URL");
        applyIfPresent(environment, overrides, "SPRING_DATASOURCE_URL");

        String configuredUrl = environment.getProperty("spring.datasource.url");
        if (configuredUrl != null && isBarePostgresUrl(configuredUrl)) {
            ParsedDatabaseUrl parsed = parsePostgresUrl(configuredUrl);
            overrides.put("spring.datasource.url", parsed.jdbcUrl());
            putIfAbsent(environment, overrides, "spring.datasource.username", parsed.username());
            putIfAbsent(environment, overrides, "spring.datasource.password", parsed.password());
        }

        if (!overrides.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(RENDER_DATABASE, overrides));
        }
    }

    private static void applyIfPresent(
            ConfigurableEnvironment environment, Map<String, Object> overrides, String envKey) {
        String rawUrl = environment.getProperty(envKey);
        if (rawUrl == null || rawUrl.isBlank() || rawUrl.startsWith("jdbc:")) {
            return;
        }
        if (!isBarePostgresUrl(rawUrl)) {
            return;
        }

        ParsedDatabaseUrl parsed = parsePostgresUrl(rawUrl);
        overrides.put("spring.datasource.url", parsed.jdbcUrl());
        putIfAbsent(environment, overrides, "spring.datasource.username", parsed.username());
        putIfAbsent(environment, overrides, "spring.datasource.password", parsed.password());
    }

    private static void putIfAbsent(
            ConfigurableEnvironment environment,
            Map<String, Object> overrides,
            String propertyKey,
            String value) {
        if (value == null || overrides.containsKey(propertyKey)) {
            return;
        }
        if (environment.getProperty(propertyKey) == null) {
            overrides.put(propertyKey, value);
        }
    }

    private static boolean isBarePostgresUrl(String url) {
        return url.startsWith("postgres://") || url.startsWith("postgresql://");
    }

    static ParsedDatabaseUrl parsePostgresUrl(String databaseUrl) {
        String normalized = databaseUrl.replace("postgres://", "postgresql://");
        URI uri = URI.create(normalized);

        String username = null;
        String password = null;
        if (uri.getUserInfo() != null) {
            String[] parts = uri.getUserInfo().split(":", 2);
            username = decode(parts[0]);
            password = parts.length > 1 ? decode(parts[1]) : "";
        }

        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String database = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");

        StringBuilder jdbcUrl = new StringBuilder()
                .append("jdbc:postgresql://")
                .append(uri.getHost())
                .append(':')
                .append(port)
                .append('/')
                .append(database);

        if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
            jdbcUrl.append('?').append(uri.getQuery());
        } else {
            jdbcUrl.append("?sslmode=require");
        }

        return new ParsedDatabaseUrl(jdbcUrl.toString(), username, password);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    record ParsedDatabaseUrl(String jdbcUrl, String username, String password) {
    }
}
