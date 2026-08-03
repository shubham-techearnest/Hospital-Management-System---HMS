package com.health360.scheduling.domain;

import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.springframework.http.HttpStatus;

import java.util.Arrays;

public enum AppointmentFilter {
    ALL,
    UPCOMING,
    PAST,
    CANCELLED;

    public static AppointmentFilter parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return ALL;
        }
        String normalized = raw.trim().toLowerCase();
        return Arrays.stream(values())
                .filter(f -> f.name().equalsIgnoreCase(normalized))
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.VALIDATION_ERROR,
                        HttpStatus.BAD_REQUEST,
                        "Invalid filter. Allowed values: all, upcoming, past, cancelled"));
    }
}
