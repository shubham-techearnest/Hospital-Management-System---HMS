package com.health360.emergency.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "emergency", name = "ed_visits")
@Getter
@Setter
public class EdVisitEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "visit_number", nullable = false, length = 40)
    private String visitNumber;

    @Column(nullable = false, length = 30)
    private String status = "ARRIVED";

    @Column(name = "arrival_mode", nullable = false, length = 40)
    private String arrivalMode = "WALK_IN";

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "triage_acuity")
    private Integer triageAcuity;

    @Column(name = "triage_notes", columnDefinition = "TEXT")
    private String triageNotes;

    @Column(name = "triaged_at")
    private Instant triagedAt;

    @Column(name = "triaged_by")
    private UUID triagedBy;

    @Column(length = 40)
    private String disposition;

    @Column(name = "disposition_at")
    private Instant dispositionAt;

    @Column(name = "disposition_by")
    private UUID dispositionBy;

    @Column(name = "disposition_notes", columnDefinition = "TEXT")
    private String dispositionNotes;

    @Column(name = "resulting_admission_id")
    private UUID resultingAdmissionId;

    @Column(name = "arrived_at", nullable = false)
    private Instant arrivedAt = Instant.now();
}
