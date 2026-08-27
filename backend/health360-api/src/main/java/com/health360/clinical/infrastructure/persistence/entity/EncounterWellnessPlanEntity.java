package com.health360.clinical.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(schema = "clinical", name = "encounter_wellness_plans")
@Getter
@Setter
public class EncounterWellnessPlanEntity extends BaseAuditableEntity {

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(columnDefinition = "TEXT")
    private String diet;

    @Column(name = "rest_guidance", columnDefinition = "TEXT")
    private String restGuidance;

    @Column(columnDefinition = "TEXT")
    private String exercise;

    @Column(columnDefinition = "TEXT")
    private String lifestyle;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
}
