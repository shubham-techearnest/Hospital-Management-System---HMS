package com.health360.ot.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ot", name = "ot_anesthesia_events")
@Getter
@Setter
public class OtAnesthesiaEventEntity extends BaseAuditableEntity {

    @Column(name = "procedure_id", nullable = false)
    private UUID procedureId;

    @Column(name = "chart_id", nullable = false)
    private UUID chartId;

    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt = Instant.now();

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column
    private Integer pulse;

    @Column
    private Integer spo2;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
