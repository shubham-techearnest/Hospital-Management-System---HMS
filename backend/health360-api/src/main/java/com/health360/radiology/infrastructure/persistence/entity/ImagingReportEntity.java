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
@Table(schema = "radiology", name = "imaging_reports")
@Getter
@Setter
public class ImagingReportEntity extends BaseAuditableEntity {

    @Column(name = "imaging_order_id", nullable = false)
    private UUID imagingOrderId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "findings_text", columnDefinition = "TEXT")
    private String findingsText;

    @Column(name = "impression_text", columnDefinition = "TEXT")
    private String impressionText;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(name = "released_by")
    private UUID releasedBy;
}
