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
@Table(schema = "laboratory", name = "lab_samples")
@Getter
@Setter
public class LabSampleEntity extends BaseAuditableEntity {

    @Column(name = "lab_order_id", nullable = false)
    private UUID labOrderId;

    @Column(name = "specimen_id", length = 50)
    private String specimenId;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt = Instant.now();

    @Column(name = "collected_by")
    private UUID collectedBy;

    private String notes;
}
