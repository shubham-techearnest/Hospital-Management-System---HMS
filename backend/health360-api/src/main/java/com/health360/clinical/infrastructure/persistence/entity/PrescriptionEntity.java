package com.health360.clinical.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "clinical", name = "prescriptions")
@Getter
@Setter
public class PrescriptionEntity extends BaseAuditableEntity {

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "prescription_number", nullable = false, length = 50)
    private String prescriptionNumber;

    @Column(nullable = false, length = 30)
    private String status = "DRAFT";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "prescribed_by")
    private UUID prescribedBy;

    @Column(name = "signed_at")
    private Instant signedAt;

    @Column(name = "signed_by")
    private UUID signedBy;
}
