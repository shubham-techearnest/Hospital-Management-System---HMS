package com.health360.icu.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "icu", name = "equipment")
@Getter
@Setter
public class IcuEquipmentEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "unit_id")
    private UUID unitId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(name = "equipment_type", nullable = false, length = 30)
    private String equipmentType = "OTHER";

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";
}
