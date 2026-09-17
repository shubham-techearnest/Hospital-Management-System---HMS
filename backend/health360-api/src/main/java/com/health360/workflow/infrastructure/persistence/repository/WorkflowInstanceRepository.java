package com.health360.workflow.infrastructure.persistence.repository;

import com.health360.workflow.infrastructure.persistence.entity.WorkflowInstanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstanceEntity, UUID> {
}
