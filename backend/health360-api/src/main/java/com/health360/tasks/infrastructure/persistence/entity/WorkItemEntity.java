package com.health360.tasks.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "tasks", name = "work_items")
@Getter
@Setter
public class WorkItemEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "task_type", nullable = false, length = 60)
    private String taskType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String priority = "NORMAL";

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "assigned_user_id")
    private UUID assignedUserId;

    @Column(name = "assigned_role", length = 50)
    private String assignedRole;

    @Column(name = "created_by_user_id")
    private UUID createdByUserId;

    @Column(name = "source_event_id")
    private UUID sourceEventId;

    @Column(name = "source_event_type", length = 100)
    private String sourceEventType;

    @Column(name = "source_entity_type", length = 100)
    private String sourceEntityType;

    @Column(name = "source_entity_id")
    private UUID sourceEntityId;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "escalation_level", nullable = false)
    private int escalationLevel = 0;

    @Column(name = "escalation_deadline")
    private Instant escalationDeadline;
}
