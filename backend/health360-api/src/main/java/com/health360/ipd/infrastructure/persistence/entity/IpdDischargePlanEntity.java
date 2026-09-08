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
@Table(schema = "ipd", name = "discharge_plans")
@Getter
@Setter
public class IpdDischargePlanEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false, unique = true)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "expected_discharge_at")
    private Instant expectedDischargeAt;

    @Column(nullable = false, length = 30)
    private String readiness = "NOT_READY";

    @Column(name = "pending_results_json", columnDefinition = "TEXT")
    private String pendingResultsJson;

    @Column(columnDefinition = "TEXT")
    private String barriers;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
