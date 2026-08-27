package com.health360.hospital.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "hospital", name = "symptom_catalog")
@Getter
@Setter
public class SymptomCatalogEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private boolean active = true;
}
