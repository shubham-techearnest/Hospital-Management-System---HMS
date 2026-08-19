package com.health360.icu.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "icu", name = "icu_bed_assignments")
@Getter
@Setter
public class IcuBedAssignmentEntity extends BaseAuditableEntity {

    @Column(name = "stay_id", nullable = false)
    private UUID stayId;

    @Column(name = "bed_id", nullable = false)
    private UUID bedId;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt = Instant.now();

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(nullable = false)
    private boolean active = true;
}
