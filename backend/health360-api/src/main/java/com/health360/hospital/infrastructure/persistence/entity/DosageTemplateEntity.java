package com.health360.hospital.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "hospital", name = "dosage_templates")
@Getter
@Setter
public class DosageTemplateEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(nullable = false, length = 120)
    private String label;

    @Column(name = "dose_text", length = 120)
    private String doseText;

    @Column(length = 40)
    private String route;

    @Column(length = 120)
    private String frequency;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(nullable = false)
    private boolean active = true;
}
