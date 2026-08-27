package com.health360.pharmacy.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "pharmacy", name = "pharmacy_requests")
@Getter
@Setter
public class PharmacyRequestEntity extends BaseAuditableEntity {

    @Column(name = "prescription_id", nullable = false)
    private UUID prescriptionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "request_number", nullable = false, length = 50)
    private String requestNumber;

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "requested_by", nullable = false)
    private UUID requestedBy;

    @Column(name = "received_at")
    private Instant receivedAt;

    @Column(name = "under_review_at")
    private Instant underReviewAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "ready_at")
    private Instant readyAt;

    @Column(name = "dispensed_at")
    private Instant dispensedAt;

    @Column(name = "dispensed_by")
    private UUID dispensedBy;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "pharmacist_notes", columnDefinition = "TEXT")
    private String pharmacistNotes;
}
