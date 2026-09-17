package com.health360.blood.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "BloodRequest")
@Table(schema = "blood", name = "requests")
@Getter
@Setter
public class BloodRequestEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "request_number", nullable = false, length = 40)
    private String requestNumber;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "admission_id")
    private UUID admissionId;

    @Column(name = "ipd_blood_request_id")
    private UUID ipdBloodRequestId;

    @Column(name = "product_type", nullable = false, length = 40)
    private String productType = "PRBC";

    @Column(name = "blood_group", nullable = false, length = 10)
    private String bloodGroup;

    @Column(name = "units_requested", nullable = false)
    private int unitsRequested = 1;

    @Column(nullable = false, length = 20)
    private String urgency = "ROUTINE";

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(columnDefinition = "TEXT")
    private String indication;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "decision_notes", columnDefinition = "TEXT")
    private String decisionNotes;

    @Column(name = "unit_id")
    private UUID unitId;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "decided_by")
    private UUID decidedBy;

    @Column(name = "issued_at")
    private Instant issuedAt;

    @Column(name = "issued_by")
    private UUID issuedBy;

    @Column(name = "completed_at")
    private Instant completedAt;
}
