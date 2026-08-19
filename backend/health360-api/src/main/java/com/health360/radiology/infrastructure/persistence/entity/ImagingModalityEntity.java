package com.health360.radiology.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "radiology", name = "imaging_modalities")
@Getter
@Setter
public class ImagingModalityEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "modality_type", nullable = false, length = 20)
    private String modalityType = "X_RAY";

    @Column(nullable = false)
    private boolean active = true;
}
