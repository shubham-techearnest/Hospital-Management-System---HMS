package com.health360.patient.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(schema = "patient", name = "chronic_conditions")
@Getter
@Setter
public class ChronicConditionEntity extends BaseAuditableEntity {

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "condition_name", nullable = false, length = 200)
    private String conditionName;

    @Column(name = "diagnosed_date")
    private LocalDate diagnosedDate;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
