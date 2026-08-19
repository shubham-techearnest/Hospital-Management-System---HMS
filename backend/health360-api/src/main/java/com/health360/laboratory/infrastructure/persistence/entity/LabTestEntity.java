package com.health360.laboratory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "laboratory", name = "lab_tests")
@Getter
@Setter
public class LabTestEntity extends BaseAuditableEntity {

    @Column(name = "laboratory_id", nullable = false)
    private UUID laboratoryId;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "specimen_type", nullable = false, length = 30)
    private String specimenType = "BLOOD";

    @Column(nullable = false)
    private boolean active = true;
}
