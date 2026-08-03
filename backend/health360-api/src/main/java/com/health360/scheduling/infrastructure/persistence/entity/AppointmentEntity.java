package com.health360.scheduling.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "scheduling", name = "appointments")
@Getter
@Setter
public class AppointmentEntity extends BaseAuditableEntity {

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "slot_id", nullable = false)
    private UUID slotId;

    @Column(name = "consultation_type", nullable = false, length = 20)
    private String consultationType;

    @Column(name = "consultation_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(nullable = false, length = 20)
    private String status = "CONFIRMED";

    @Column(name = "reason_for_visit", length = 500)
    private String reasonForVisit;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "rescheduled_from_id")
    private UUID rescheduledFromId;

    @Column(name = "rescheduled_to_id")
    private UUID rescheduledToId;

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(name = "reschedule_requested_at")
    private Instant rescheduleRequestedAt;

    @Column(name = "postponed_at")
    private Instant postponedAt;

    @Column(name = "postpone_reason", columnDefinition = "TEXT")
    private String postponeReason;
}
