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
@Table(schema = "pharmacy", name = "medication_administrations")
@Getter
@Setter
public class MedicationAdministrationEntity extends BaseAuditableEntity {

    @Column(name = "medication_order_item_id", nullable = false)
    private UUID medicationOrderItemId;

    @Column(name = "medication_order_id", nullable = false)
    private UUID medicationOrderId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "dose_given", nullable = false, length = 100)
    private String doseGiven;

    @Column(length = 30)
    private String route;

    @Column(name = "administered_at", nullable = false)
    private Instant administeredAt = Instant.now();

    @Column(name = "administered_by", nullable = false)
    private UUID administeredBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
