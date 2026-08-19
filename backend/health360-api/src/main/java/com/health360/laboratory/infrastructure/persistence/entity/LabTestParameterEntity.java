package com.health360.laboratory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "laboratory", name = "lab_test_parameters")
@Getter
@Setter
public class LabTestParameterEntity extends BaseAuditableEntity {

    @Column(name = "lab_test_id", nullable = false)
    private UUID labTestId;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 30)
    private String unit;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;
}
