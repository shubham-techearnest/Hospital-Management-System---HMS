package com.health360.pharmacy.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "pharmacy", name = "medication_order_items")
@Getter
@Setter
public class MedicationOrderItemEntity extends BaseAuditableEntity {

    @Column(name = "medication_order_id", nullable = false)
    private UUID medicationOrderId;

    @Column(name = "clinical_order_item_id", nullable = false)
    private UUID clinicalOrderItemId;

    @Column(name = "medicine_id")
    private UUID medicineId;

    @Column(name = "medicine_name", nullable = false, length = 300)
    private String medicineName;

    @Column(nullable = false, length = 30)
    private String status = "RECEIVED";

    @Column(name = "dose_text", length = 100)
    private String doseText;

    @Column(length = 30)
    private String route;

    @Column(length = 100)
    private String frequency;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "planned_at")
    private Instant plannedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
