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
@Table(schema = "ipd", name = "discharge_summaries")
@Getter
@Setter
public class IpdDischargeSummaryEntity extends BaseAuditableEntity {

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "summary_text", nullable = false)
    private String summaryText;

    @Column(name = "follow_up_plan")
    private String followUpPlan;

    @Column(name = "discharged_at", nullable = false)
    private Instant dischargedAt = Instant.now();

    @Column(name = "discharge_type", nullable = false, length = 30)
    private String dischargeType = "ROUTINE";

    @Column(name = "version_no", nullable = false)
    private int versionNo = 1;

    @Column(name = "summary_status", nullable = false, length = 20)
    private String summaryStatus = "FINAL";

    @Column(name = "diagnosis_text", columnDefinition = "TEXT")
    private String diagnosisText;

    @Column(name = "medications_text", columnDefinition = "TEXT")
    private String medicationsText;

    @Column(name = "advice_text", columnDefinition = "TEXT")
    private String adviceText;

    @Column(name = "structured_json", columnDefinition = "TEXT")
    private String structuredJson;
}
