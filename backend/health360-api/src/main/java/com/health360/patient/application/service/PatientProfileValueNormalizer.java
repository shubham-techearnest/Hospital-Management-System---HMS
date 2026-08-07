package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;

/**
 * Maps legacy/dev seed display values to API enum codes consumed by web and mobile clients.
 */
public final class PatientProfileValueNormalizer {

    private PatientProfileValueNormalizer() {
    }

    public static String normalizeBloodGroup(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return switch (value.trim().toUpperCase()) {
            case "A+" -> "A_POSITIVE";
            case "A-" -> "A_NEGATIVE";
            case "B+" -> "B_POSITIVE";
            case "B-" -> "B_NEGATIVE";
            case "AB+" -> "AB_POSITIVE";
            case "AB-" -> "AB_NEGATIVE";
            case "O+" -> "O_POSITIVE";
            case "O-" -> "O_NEGATIVE";
            default -> value.trim();
        };
    }

    public static String normalizeSmokingFrequency(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return "NONE".equalsIgnoreCase(value.trim()) ? "NEVER" : value.trim();
    }

    public static String normalizeAlcoholConsumption(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return "OCCASIONALLY".equalsIgnoreCase(value.trim()) ? "OCCASIONAL" : value.trim();
    }

    public static String normalizeOccupationType(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return "OFFICE".equalsIgnoreCase(value.trim()) ? "SEDENTARY" : value.trim();
    }

    public static void normalizeProfileFields(PatientProfileEntity profile) {
        profile.setBloodGroup(normalizeBloodGroup(profile.getBloodGroup()));
        profile.setSmokingFrequency(normalizeSmokingFrequency(profile.getSmokingFrequency()));
        profile.setAlcoholConsumption(normalizeAlcoholConsumption(profile.getAlcoholConsumption()));
        profile.setOccupationType(normalizeOccupationType(profile.getOccupationType()));
    }

    public static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
