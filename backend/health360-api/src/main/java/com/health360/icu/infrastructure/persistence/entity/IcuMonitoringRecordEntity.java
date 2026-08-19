package com.health360.icu.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(schema = "icu", name = "monitoring_records")
@Getter
@Setter
public class IcuMonitoringRecordEntity extends BaseAuditableEntity {

    @Column(name = "stay_id", nullable = false)
    private UUID stayId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "record_type", nullable = false, length = 30)
    private String recordType = "VITALS";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> payload;

    private String notes;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt = Instant.now();

    @Column(name = "recorded_by")
    private UUID recordedBy;
}
