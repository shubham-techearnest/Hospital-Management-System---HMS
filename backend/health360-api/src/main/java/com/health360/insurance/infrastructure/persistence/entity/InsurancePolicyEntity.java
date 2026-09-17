package com.health360.insurance.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "InsurancePolicy")
@Table(schema = "insurance", name = "policies")
@Getter
@Setter
public class InsurancePolicyEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "payer_id", nullable = false)
    private UUID payerId;

    @Column(name = "policy_number", nullable = false, length = 80)
    private String policyNumber;

    @Column(name = "member_id", length = 80)
    private String memberId;

    @Column(name = "holder_name", length = 200)
    private String holderName;

    @Column(name = "claim_mode", nullable = false, length = 30)
    private String claimMode = "CASHLESS";

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "coverage_limit")
    private BigDecimal coverageLimit;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
