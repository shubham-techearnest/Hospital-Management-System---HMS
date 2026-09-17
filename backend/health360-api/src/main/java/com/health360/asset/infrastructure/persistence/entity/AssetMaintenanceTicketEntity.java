package com.health360.asset.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "AssetMaintenanceTicket")
@Table(schema = "asset", name = "maintenance_tickets")
@Getter
@Setter
public class AssetMaintenanceTicketEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Column(name = "ticket_number", nullable = false, length = 40)
    private String ticketNumber;

    @Column(name = "ticket_type", nullable = false, length = 30)
    private String ticketType;

    @Column(nullable = false, length = 30)
    private String status = "OPEN";

    @Column(nullable = false, length = 20)
    private String priority = "NORMAL";

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reported_by")
    private UUID reportedBy;

    @Column(name = "assigned_role", length = 50)
    private String assignedRole;

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
}
