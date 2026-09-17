package com.health360.workflow.infrastructure.persistence.repository;

import com.health360.workflow.infrastructure.persistence.entity.WorkflowDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinitionEntity, UUID> {

    Optional<WorkflowDefinitionEntity> findFirstByTenantIdAndWorkflowKeyAndActiveTrueAndDeletedAtIsNullOrderByVersionNoDesc(
            UUID tenantId, String workflowKey);
}
