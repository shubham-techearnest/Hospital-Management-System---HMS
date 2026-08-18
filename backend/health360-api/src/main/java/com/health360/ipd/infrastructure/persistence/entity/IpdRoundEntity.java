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
@Table(schema = "ipd", name = "rounds")
@Getter
@Setter
public class IpdRoundEntity extends BaseAuditableEntity {

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "round_type", nullable = false, length = 20)
    private String roundType = "DOCTOR";

    @Column(nullable = false)
    private String notes;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt = Instant.now();

    @Column(name = "recorded_by")
    private UUID recordedBy;
}
