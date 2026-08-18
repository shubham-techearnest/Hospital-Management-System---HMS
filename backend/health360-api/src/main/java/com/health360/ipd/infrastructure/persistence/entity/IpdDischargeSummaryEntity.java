package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "discharge_summaries")
@Getter
@Setter
public class IpdDischargeSummaryEntity extends BaseAuditableEntity {

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "summary_text", nullable = false)
    private String summaryText;

    @Column(name = "follow_up_plan")
    private String followUpPlan;

    @Column(name = "discharged_at", nullable = false)
    private Instant dischargedAt = Instant.now();
}
