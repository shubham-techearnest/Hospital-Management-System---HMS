package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "blood_requests")
@Getter
@Setter
public class IpdBloodRequestEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "product_type", nullable = false, length = 40)
    private String productType = "PRBC";

    @Column(nullable = false)
    private int units = 1;

    @Column(nullable = false, length = 20)
    private String urgency = "ROUTINE";

    @Column(columnDefinition = "TEXT")
    private String indication;

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "requested_by")
    private UUID requestedBy;
}
