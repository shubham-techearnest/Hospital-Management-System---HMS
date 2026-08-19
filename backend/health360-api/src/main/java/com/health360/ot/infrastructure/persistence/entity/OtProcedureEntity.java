package com.health360.ot.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ot", name = "ot_procedures")
@Getter
@Setter
public class OtProcedureEntity extends BaseAuditableEntity {

    @Column(name = "clinical_order_item_id", nullable = false)
    private UUID clinicalOrderItemId;

    @Column(name = "clinical_order_id", nullable = false)
    private UUID clinicalOrderId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "theatre_id")
    private UUID theatreId;

    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Column(name = "procedure_name", nullable = false, length = 300)
    private String procedureName;

    @Column(nullable = false, length = 30)
    private String status = "RECEIVED";

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
