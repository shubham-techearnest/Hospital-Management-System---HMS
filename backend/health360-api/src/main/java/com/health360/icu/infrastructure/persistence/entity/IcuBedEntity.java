package com.health360.icu.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "icu", name = "icu_beds")
@Getter
@Setter
public class IcuBedEntity extends BaseAuditableEntity {

    @Column(name = "unit_id", nullable = false)
    private UUID unitId;

    @Column(name = "bed_number", nullable = false, length = 20)
    private String bedNumber;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";
}
