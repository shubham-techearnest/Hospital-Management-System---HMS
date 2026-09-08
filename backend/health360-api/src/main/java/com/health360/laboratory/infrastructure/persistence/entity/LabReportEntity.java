package com.health360.laboratory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "laboratory", name = "lab_reports")
@Getter
@Setter
public class LabReportEntity extends BaseAuditableEntity {

    @Column(name = "lab_order_id", nullable = false)
    private UUID labOrderId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "summary_text")
    private String summaryText;

    @Column(name = "released_at", nullable = false)
    private Instant releasedAt = Instant.now();

    @Column(name = "released_by")
    private UUID releasedBy;

    @Column(nullable = false)
    private boolean critical;

    @Column(name = "critical_acknowledged_at")
    private Instant criticalAcknowledgedAt;

    @Column(name = "critical_acknowledged_by")
    private UUID criticalAcknowledgedBy;

    @Column(name = "critical_ack_note", columnDefinition = "TEXT")
    private String criticalAckNote;
}
