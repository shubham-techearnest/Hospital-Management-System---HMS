package com.health360.billing.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "billing", name = "charge_exceptions")
@Getter
@Setter
public class ChargeExceptionEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "source_event_id")
    private UUID sourceEventId;

    @Column(name = "source_event_type", nullable = false, length = 80)
    private String sourceEventType;

    @Column(name = "reason_code", nullable = false, length = 60)
    private String reasonCode;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false, length = 30)
    private String status = "OPEN";

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "resolved_by")
    private UUID resolvedBy;
}
