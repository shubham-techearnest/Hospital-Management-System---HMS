package com.health360.analytics.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(schema = "analytics", name = "health_metrics_snapshots")
@Getter
@Setter
public class HealthMetricsSnapshotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt;

    @Column(name = "profile_completion_at_calc", nullable = false)
    private int profileCompletionAtCalc;

    @Column(name = "wellness_score")
    private Integer wellnessScore;

    @Column(name = "wellness_label", length = 20)
    private String wellnessLabel;

    @Column(name = "health_risk_score")
    private Integer healthRiskScore;

    @Column(name = "health_risk_label", length = 20)
    private String healthRiskLabel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "wellness_factors")
    private Map<String, Object> wellnessFactors;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "risk_factors")
    private Map<String, Object> riskFactors;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
