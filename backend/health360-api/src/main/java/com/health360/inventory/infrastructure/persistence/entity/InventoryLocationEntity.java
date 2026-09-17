package com.health360.inventory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "inventory", name = "locations")
@Getter
@Setter
public class InventoryLocationEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(nullable = false, length = 40)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "location_type", nullable = false, length = 30)
    private String locationType = "CENTRAL_STORE";

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(nullable = false)
    private boolean active = true;
}
