package com.health360.patient.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "patient", name = "lab_value_records")
@Getter
@Setter
public class LabValueRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    private BigDecimal hba1c;

    @Column(name = "total_cholesterol", precision = 5, scale = 1)
    private BigDecimal totalCholesterol;

    @Column(precision = 5, scale = 1)
    private BigDecimal hdl;

    @Column(precision = 5, scale = 1)
    private BigDecimal ldl;

    @Column(precision = 5, scale = 1)
    private BigDecimal triglycerides;

    @Column(precision = 4, scale = 1)
    private BigDecimal hemoglobin;

    @Column(name = "vitamin_d", precision = 5, scale = 1)
    private BigDecimal vitaminD;

    @Column(precision = 5, scale = 2)
    private BigDecimal tsh;

    @Column(precision = 4, scale = 2)
    private BigDecimal creatinine;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;
}
