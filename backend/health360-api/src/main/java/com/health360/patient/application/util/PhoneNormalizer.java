package com.health360.patient.application.util;

public final class PhoneNormalizer {

    private PhoneNormalizer() {
    }

    public static String normalize(String phone) {
        if (phone == null || phone.isBlank()) {
            return "";
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() > 10) {
            return digits.substring(digits.length() - 10);
        }
        return digits;
    }

    public static String toStorageFormat(String phone) {
        String normalized = normalize(phone);
        if (normalized.isEmpty()) {
            return phone != null ? phone.trim() : "";
        }
        if (normalized.length() == 10) {
            return "+91" + normalized;
        }
        return phone.trim();
    }
}
