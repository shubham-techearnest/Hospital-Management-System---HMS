package com.health360.asset.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "asset", name = "maintenance_logs")
@Getter
@Setter
public class AssetMaintenanceLogEntity extends BaseAuditableEntity {

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "maintenance_type", nullable = false, length = 30)
    private String maintenanceType;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt = Instant.now();

    @Column(name = "performed_by")
    private UUID performedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "next_due_at")
    private Instant nextDueAt;

    @Column(name = "cost_amount", precision = 12, scale = 2)
    private BigDecimal costAmount;
}
