package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AppointmentSummaryResponse {
    UUID appointmentId;
    String status;
    Instant scheduledAt;
    String consultationType;
    BigDecimal consultationFee;
    String currency;
    String reasonForVisit;
    DoctorSummary doctor;
    PatientSummary patient;
    HospitalSummary hospital;
    boolean canCancel;
    boolean canReschedule;
    boolean canConfirm;
    boolean canRequestReschedule;
    boolean canPostpone;
    boolean canResume;

    @Value
    @Builder
    public static class DoctorSummary {
        UUID id;
        String name;
        String specialization;
    }

    @Value
    @Builder
    public static class PatientSummary {
        UUID id;
        String name;
    }

    @Value
    @Builder
    public static class HospitalSummary {
        UUID id;
        UUID branchId;
        String name;
        String branchName;
    }
}
