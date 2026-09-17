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

@Entity(name = "InsuranceClaim")
@Table(schema = "insurance", name = "claims")
@Getter
@Setter
public class InsuranceClaimEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "pre_authorization_id")
    private UUID preAuthorizationId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "admission_id")
    private UUID admissionId;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "claim_number", nullable = false, length = 40)
    private String claimNumber;

    @Column(nullable = false, length = 30)
    private String status = "DRAFT";

    @Column(name = "claimed_amount", nullable = false)
    private BigDecimal claimedAmount = BigDecimal.ZERO;

    @Column(name = "approved_amount")
    private BigDecimal approvedAmount;

    @Column(name = "settled_amount")
    private BigDecimal settledAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "settled_at")
    private Instant settledAt;
}
