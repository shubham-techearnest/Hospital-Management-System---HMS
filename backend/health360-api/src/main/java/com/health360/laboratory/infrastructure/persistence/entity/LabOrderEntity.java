package com.health360.laboratory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "laboratory", name = "lab_orders")
@Getter
@Setter
public class LabOrderEntity extends BaseAuditableEntity {

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

    @Column(name = "lab_test_id", nullable = false)
    private UUID labTestId;

    @Column(nullable = false, length = 30)
    private String status = "RECEIVED";

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();
}
