package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "wards")
@Getter
@Setter
public class IpdWardEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(name = "ward_type", nullable = false, length = 30)
    private String wardType = "GENERAL";

    @Column(nullable = false)
    private boolean active = true;
}
