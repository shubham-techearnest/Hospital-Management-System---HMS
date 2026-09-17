package com.health360.insurance.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity(name = "InsurancePreAuthorization")
@Table(schema = "insurance", name = "pre_authorizations")
@Getter
@Setter
public class InsurancePreAuthorizationEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "admission_id")
    private UUID admissionId;

    @Column(name = "auth_number", nullable = false, length = 40)
    private String authNumber;

    @Column(name = "auth_type", nullable = false, length = 30)
    private String authType = "PRE_AUTH";

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(name = "requested_amount")
    private BigDecimal requestedAmount;

    @Column(name = "approved_amount")
    private BigDecimal approvedAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "decision_notes", columnDefinition = "TEXT")
    private String decisionNotes;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "decided_by")
    private UUID decidedBy;
}
