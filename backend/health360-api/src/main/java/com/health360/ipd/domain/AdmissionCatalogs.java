package com.health360.ipd.domain;

import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class AdmissionCatalogs {

    private AdmissionCatalogs() {}

    public static final List<String> SOURCES = List.of(
            "OPD", "EMERGENCY", "DIRECT", "REFERRAL", "TRANSFER_IN",
            "PLANNED_SURGERY", "DAY_CARE", "ICU_TRANSFER", "HDU_TRANSFER", "OTHER"
    );

    public static final List<String> TYPES = List.of(
            "ELECTIVE", "EMERGENCY", "URGENT", "ROUTINE", "PLANNED",
            "SURGICAL", "MEDICAL", "OBSERVATION", "ICU", "HDU",
            "ISOLATION", "MATERNITY", "PEDIATRIC", "ONCOLOGY", "OTHER"
    );

    public static final List<String> PRIORITIES = List.of("ROUTINE", "URGENT", "EMERGENCY");

    public static String requireSource(String value) {
        return requireIn(value, SOURCES, "admissionSource");
    }

    public static String requireType(String value) {
        return requireIn(value, TYPES, "admissionType");
    }

    public static String requirePriority(String value) {
        if (value == null || value.isBlank()) {
            return "ROUTINE";
        }
        return requireIn(value, PRIORITIES, "priority");
    }

    private static String requireIn(String value, List<String> allowed, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!Set.copyOf(allowed).contains(normalized)) {
            throw new IllegalArgumentException("Invalid " + field + ": " + value);
        }
        return normalized;
    }
}
