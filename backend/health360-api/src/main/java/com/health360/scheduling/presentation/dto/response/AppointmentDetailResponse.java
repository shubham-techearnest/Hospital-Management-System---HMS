package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AppointmentDetailResponse {
    UUID appointmentId;
    String status;
    Instant scheduledAt;
    String consultationType;
    BigDecimal consultationFee;
    String currency;
    String reasonForVisit;
    Instant cancelledAt;
    String cancellationReason;
    Instant completedAt;
    UUID rescheduledFromId;
    UUID rescheduledToId;
    UUID slotId;
    AppointmentSummaryResponse.DoctorSummary doctor;
    AppointmentSummaryResponse.PatientSummary patient;
    AppointmentSummaryResponse.HospitalSummary hospital;
    boolean canCancel;
    boolean canReschedule;
    boolean canConfirm;
    boolean canRequestReschedule;
    boolean canPostpone;
    boolean canResume;
    boolean canMarkCompleted;
    boolean canMarkNoShow;
    String doctorNotes;
    Instant rescheduleRequestedAt;
    Instant postponedAt;
    String postponeReason;
}
