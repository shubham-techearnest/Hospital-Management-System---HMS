package com.health360.workflow.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(schema = "workflow", name = "definitions")
@Getter
@Setter
public class WorkflowDefinitionEntity extends BaseAuditableEntity {

    @Column(name = "workflow_key", nullable = false, length = 100)
    private String workflowKey;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "version_no", nullable = false)
    private int versionNo = 1;

    @Column(nullable = false)
    private boolean active = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "definition_json", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> definitionJson = new HashMap<>();
}
