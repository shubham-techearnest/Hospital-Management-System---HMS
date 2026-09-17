package com.health360.automation.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(schema = "automation", name = "hospital_events")
@Getter
@Setter
public class HospitalEventEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "correlation_id")
    private UUID correlationId;

    @Column(name = "source_module", nullable = false, length = 50)
    private String sourceModule;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> payload = new HashMap<>();

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt = Instant.now();
}
