package com.health360.opd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(schema = "opd", name = "queue_entries")
@Getter
@Setter
public class OpdQueueEntryEntity extends BaseAuditableEntity {

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "desk_id")
    private UUID deskId;

    @Column(name = "appointment_id")
    private UUID appointmentId;

    @Column(name = "registration_type", nullable = false, length = 20)
    private String registrationType;

    @Column(name = "token_number", nullable = false)
    private int tokenNumber;

    @Column(name = "token_display", nullable = false, length = 20)
    private String tokenDisplay;

    @Column(name = "queue_date", nullable = false)
    private LocalDate queueDate;

    @Column(nullable = false, length = 20)
    private String status = "WAITING";

    @Column(nullable = false)
    private int priority = 0;

    @Column(name = "checked_in_at", nullable = false)
    private Instant checkedInAt = Instant.now();

    @Column(name = "called_at")
    private Instant calledAt;

    @Column(name = "service_started_at")
    private Instant serviceStartedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "skipped_at")
    private Instant skippedAt;

    @Column(name = "skip_reason", length = 500)
    private String skipReason;

    @Column(name = "recalled_at")
    private Instant recalledAt;
}
