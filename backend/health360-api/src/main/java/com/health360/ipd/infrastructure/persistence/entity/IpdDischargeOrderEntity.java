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
@Table(schema = "ipd", name = "discharge_orders")
@Getter
@Setter
public class IpdDischargeOrderEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "ordered_at", nullable = false)
    private Instant orderedAt = Instant.now();

    @Column(name = "ordered_by", nullable = false)
    private UUID orderedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";
}
