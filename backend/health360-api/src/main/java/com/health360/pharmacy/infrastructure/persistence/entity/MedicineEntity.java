package com.health360.pharmacy.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "pharmacy", name = "medicines")
@Getter
@Setter
public class MedicineEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 30)
    private String form = "TABLET";

    @Column(length = 50)
    private String strength;

    @Column(name = "default_route", nullable = false, length = 30)
    private String defaultRoute = "ORAL";

    @Column(nullable = false)
    private boolean active = true;
}
