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
@Table(schema = "ipd", name = "financial_clearances")
@Getter
@Setter
public class IpdFinancialClearanceEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false, unique = true)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "cleared_at")
    private Instant clearedAt;

    @Column(name = "cleared_by")
    private UUID clearedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
