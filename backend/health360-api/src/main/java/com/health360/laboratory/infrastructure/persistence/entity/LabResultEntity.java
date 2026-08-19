package com.health360.laboratory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "laboratory", name = "lab_results")
@Getter
@Setter
public class LabResultEntity extends BaseAuditableEntity {

    @Column(name = "lab_order_id", nullable = false)
    private UUID labOrderId;

    @Column(name = "parameter_id", nullable = false)
    private UUID parameterId;

    @Column(name = "value_text", nullable = false, length = 200)
    private String valueText;

    @Column(name = "value_numeric", precision = 12, scale = 4)
    private BigDecimal valueNumeric;

    @Column(length = 30)
    private String unit;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt = Instant.now();

    @Column(name = "recorded_by")
    private UUID recordedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;
}
