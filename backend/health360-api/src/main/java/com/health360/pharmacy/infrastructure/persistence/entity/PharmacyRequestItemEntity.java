package com.health360.pharmacy.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "pharmacy", name = "pharmacy_request_items")
@Getter
@Setter
public class PharmacyRequestItemEntity extends BaseAuditableEntity {

    @Column(name = "pharmacy_request_id", nullable = false)
    private UUID pharmacyRequestId;

    @Column(name = "prescription_item_id", nullable = false)
    private UUID prescriptionItemId;

    @Column(name = "medicine_id")
    private UUID medicineId;

    @Column(name = "medicine_name", nullable = false, length = 300)
    private String medicineName;

    @Column(name = "quantity_requested", nullable = false)
    private Integer quantityRequested = 1;

    @Column(name = "quantity_dispensed", nullable = false)
    private Integer quantityDispensed = 0;

    @Column(name = "availability_status", nullable = false, length = 30)
    private String availabilityStatus = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String notes;
}
