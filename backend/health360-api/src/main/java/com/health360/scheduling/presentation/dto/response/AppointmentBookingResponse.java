package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AppointmentBookingResponse {
    UUID appointmentId;
    String status;
    DoctorSummary doctor;
    HospitalSummary hospital;
    Instant scheduledAt;
    String consultationType;
    FeeSummary consultationFee;
    String reasonForVisit;

    @Value
    @Builder
    public static class DoctorSummary {
        UUID id;
        String name;
        String specialization;
    }

    @Value
    @Builder
    public static class HospitalSummary {
        UUID id;
        UUID branchId;
        String name;
        String branchName;
    }

    @Value
    @Builder
    public static class FeeSummary {
        BigDecimal amount;
        String currency;
    }
}
