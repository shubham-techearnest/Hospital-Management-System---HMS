package com.health360.asset.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity(name = "AssetStatusHistory")
@Table(schema = "asset", name = "status_history")
@Getter
@Setter
public class AssetStatusHistoryEntity extends BaseAuditableEntity {

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "from_status", length = 20)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 20)
    private String toStatus;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(name = "changed_at", nullable = false)
    private java.time.Instant changedAt = java.time.Instant.now();
}
