package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "admission_payers")
@Getter
@Setter
public class IpdAdmissionPayerEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "payer_mode", nullable = false, length = 30)
    private String payerMode = "SELF_PAY";

    @Column(name = "payer_name", length = 200)
    private String payerName;

    @Column(name = "policy_number", length = 100)
    private String policyNumber;

    @Column(name = "member_id", length = 100)
    private String memberId;

    @Column(name = "claim_mode", length = 30)
    private String claimMode;

    @Column(name = "primary_payer", nullable = false)
    private boolean primaryPayer = true;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
