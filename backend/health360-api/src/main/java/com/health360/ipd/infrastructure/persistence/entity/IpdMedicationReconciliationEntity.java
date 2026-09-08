package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "medication_reconciliations")
@Getter
@Setter
public class IpdMedicationReconciliationEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "recon_type", nullable = false, length = 20)
    private String reconType;

    @Column(nullable = false, length = 20)
    private String status = "COMPLETED";

    @Column(name = "summary_text", columnDefinition = "TEXT")
    private String summaryText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "decisions_json", nullable = false, columnDefinition = "jsonb")
    private List<Map<String, Object>> decisionsJson = new ArrayList<>();

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt = Instant.now();

    @Column(name = "completed_by")
    private UUID completedBy;
}
