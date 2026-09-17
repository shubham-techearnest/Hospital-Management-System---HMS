package com.health360.asset.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "AssetMaintenanceSchedule")
@Table(schema = "asset", name = "maintenance_schedules")
@Getter
@Setter
public class AssetMaintenanceScheduleEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "schedule_type", nullable = false, length = 30)
    private String scheduleType;

    @Column(nullable = false, length = 30)
    private String cadence;

    @Column(name = "interval_days")
    private Integer intervalDays;

    @Column(name = "next_due_at", nullable = false)
    private Instant nextDueAt;

    @Column(name = "last_generated_at")
    private Instant lastGeneratedAt;

    @Column(nullable = false)
    private boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
