package com.health360.radiology.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "radiology", name = "imaging_studies")
@Getter
@Setter
public class ImagingStudyEntity extends BaseAuditableEntity {

    @Column(name = "imaging_order_id", nullable = false)
    private UUID imagingOrderId;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "performed_at")
    private Instant performedAt;

    @Column(name = "performed_by")
    private UUID performedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
