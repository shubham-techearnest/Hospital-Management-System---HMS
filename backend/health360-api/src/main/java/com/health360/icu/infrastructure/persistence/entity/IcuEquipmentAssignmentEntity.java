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
@Table(schema = "icu", name = "equipment_assignments")
@Getter
@Setter
public class IcuEquipmentAssignmentEntity extends BaseAuditableEntity {

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Column(name = "stay_id", nullable = false)
    private UUID stayId;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt = Instant.now();

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(nullable = false)
    private boolean active = true;

    private String notes;
}
