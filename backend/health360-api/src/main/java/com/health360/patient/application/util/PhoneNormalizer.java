package com.health360.patient.application.util;

public final class PhoneNormalizer {

    private PhoneNormalizer() {
    }

    /**
     * Digits-only form used for duplicate matching / search.
     * Keeps last 10 digits for legacy India-centric matching when longer.
     */
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

    /**
     * Persist E.164 when provided; otherwise treat bare 10-digit numbers as India (+91).
     */
    public static String toStorageFormat(String phone) {
        if (phone == null || phone.isBlank()) {
            return "";
        }
        String trimmed = phone.trim();
        String digits = trimmed.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            return trimmed;
        }
        if (trimmed.startsWith("+") && digits.length() >= 8 && digits.length() <= 15) {
            return "+" + digits;
        }
        if (digits.length() == 10) {
            return "+91" + digits;
        }
        if (digits.length() >= 8 && digits.length() <= 15) {
            return "+" + digits;
        }
        return trimmed;
    }
}
