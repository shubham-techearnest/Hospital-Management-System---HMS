package com.health360.ipd.infrastructure.persistence.entity;

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
@Table(schema = "ipd", name = "payer_authorizations")
@Getter
@Setter
public class IpdPayerAuthorizationEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "payer_id")
    private UUID payerId;

    @Column(name = "auth_type", nullable = false, length = 30)
    private String authType = "PRE_AUTH";

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(name = "auth_number", length = 100)
    private String authNumber;

    @Column(name = "approved_amount", precision = 12, scale = 2)
    private BigDecimal approvedAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "decided_at")
    private Instant decidedAt;
}
