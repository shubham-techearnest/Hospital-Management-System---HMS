package com.health360.workflow.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(schema = "workflow", name = "instances")
@Getter
@Setter
public class WorkflowInstanceEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Column(name = "definition_id", nullable = false)
    private UUID definitionId;

    @Column(name = "workflow_key", nullable = false, length = 100)
    private String workflowKey;

    @Column(nullable = false, length = 30)
    private String status = "RUNNING";

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "current_step_key", length = 100)
    private String currentStepKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "context_json", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> contextJson = new HashMap<>();

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;
}
