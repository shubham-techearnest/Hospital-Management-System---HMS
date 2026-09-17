package com.health360.inventory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "inventory", name = "items")
@Getter
@Setter
public class InventoryItemEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(nullable = false, length = 40)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 40)
    private String category = "GENERAL";

    @Column(name = "unit_of_measure", nullable = false, length = 20)
    private String unitOfMeasure = "EACH";

    @Column(name = "reorder_level")
    private Integer reorderLevel;

    @Column(name = "track_expiry", nullable = false)
    private boolean trackExpiry = false;

    @Column(nullable = false)
    private boolean active = true;
}
