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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(schema = "analytics", name = "calculated_metrics")
@Getter
@Setter
public class CalculatedMetricEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "snapshot_id", nullable = false)
    private UUID snapshotId;

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(precision = 12, scale = 4)
    private BigDecimal value;

    @Column(length = 30)
    private String unit;

    @Column(nullable = false, length = 20)
    private String classification;

    @Column(columnDefinition = "TEXT")
    private String interpretation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "missing_fields")
    private List<String> missingFields;

    @Column(name = "display_value", length = 100)
    private String displayValue;
}
