package com.health360.clinical.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "clinical", name = "prescription_items")
@Getter
@Setter
public class PrescriptionItemEntity extends BaseAuditableEntity {

    @Column(name = "prescription_id", nullable = false)
    private UUID prescriptionId;

    @Column(name = "medicine_id")
    private UUID medicineId;

    @Column(name = "medicine_code", length = 30)
    private String medicineCode;

    @Column(name = "medicine_name", nullable = false, length = 300)
    private String medicineName;

    @Column(name = "dose_text", length = 100)
    private String doseText;

    @Column(length = 30)
    private String route;

    @Column(length = 100)
    private String frequency;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "safety_warning", length = 500)
    private String safetyWarning;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
