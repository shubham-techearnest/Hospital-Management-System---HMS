package com.health360.clinical.infrastructure.persistence.entity;

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
@Table(schema = "clinical", name = "vital_signs")
@Getter
@Setter
public class ClinicalVitalSignEntity extends BaseAuditableEntity {

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(precision = 4, scale = 1)
    private BigDecimal temperature;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    private Integer spo2;

    @Column(name = "blood_glucose", precision = 5, scale = 1)
    private BigDecimal bloodGlucose;

    @Column(name = "glucose_reading_type", length = 20)
    private String glucoseReadingType;

    @Column(length = 500)
    private String notes;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}
