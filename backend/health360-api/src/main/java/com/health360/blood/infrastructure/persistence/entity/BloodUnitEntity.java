package com.health360.blood.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "BloodUnit")
@Table(schema = "blood", name = "units")
@Getter
@Setter
public class BloodUnitEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "unit_number", nullable = false, length = 40)
    private String unitNumber;

    @Column(name = "product_type", nullable = false, length = 40)
    private String productType = "PRBC";

    @Column(name = "blood_group", nullable = false, length = 10)
    private String bloodGroup;

    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE";

    @Column(name = "collected_at")
    private Instant collectedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "donor_ref", length = 80)
    private String donorRef;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
