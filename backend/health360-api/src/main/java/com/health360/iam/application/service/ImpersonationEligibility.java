package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Fail-closed gate for user impersonation.
 * Requires explicit {@code health360.impersonation.enabled=true} AND an active Spring profile
 * listed in {@code allowed-profiles}. Any {@code production} profile always denies.
 */
@Component
@RequiredArgsConstructor
public class ImpersonationEligibility {

    private final Health360Properties properties;
    private final Environment environment;

    public boolean isEnabled() {
        Health360Properties.Impersonation cfg = properties.getImpersonation();
        if (cfg == null || !cfg.isEnabled()) {
            return false;
        }
        Set<String> active = activeProfiles();
        if (active.stream().anyMatch(p -> "production".equalsIgnoreCase(p))) {
            return false;
        }
        Set<String> allowed = allowedProfiles();
        if (allowed.isEmpty()) {
            return false;
        }
        return active.stream().anyMatch(allowed::contains);
    }

    public void assertEnabled() {
        if (!isEnabled()) {
            throw ImpersonationExceptions.disabled();
        }
    }

    public String environmentLabel() {
        Set<String> active = activeProfiles();
        Set<String> allowed = allowedProfiles();
        return active.stream()
                .filter(allowed::contains)
                .findFirst()
                .or(() -> active.stream().findFirst())
                .orElse("dev")
                .toUpperCase(Locale.ROOT);
    }

    public boolean hasProductionProfile() {
        return activeProfiles().stream().anyMatch(p -> "production".equalsIgnoreCase(p));
    }

    public Set<String> activeProfiles() {
        String[] active = environment.getActiveProfiles();
        if (active.length == 0) {
            active = environment.getDefaultProfiles();
        }
        return Arrays.stream(active)
                .map(p -> p.toLowerCase(Locale.ROOT))
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    public Set<String> allowedProfiles() {
        String raw = properties.getImpersonation().getAllowedProfiles();
        if (raw == null || raw.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .filter(s -> !"production".equals(s))
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    public long maxDurationMinutes() {
        long minutes = properties.getImpersonation().getMaxDurationMinutes();
        return minutes > 0 ? minutes : 60;
    }
}
