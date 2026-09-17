package com.health360.workflow.application.service;

import com.health360.automation.domain.TaskTypes;
import com.health360.tasks.application.service.TaskService;
import com.health360.workflow.infrastructure.persistence.entity.WorkflowDefinitionEntity;
import com.health360.workflow.infrastructure.persistence.entity.WorkflowInstanceEntity;
import com.health360.workflow.infrastructure.persistence.repository.WorkflowDefinitionRepository;
import com.health360.workflow.infrastructure.persistence.repository.WorkflowInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowRuntimeService {

    public static final String DISCHARGE_HOUSEKEEPING = "DISCHARGE_HOUSEKEEPING";

    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowInstanceRepository instanceRepository;
    private final TaskService taskService;

    @Transactional
    public WorkflowInstanceEntity start(
            UUID tenantId,
            UUID hospitalId,
            UUID branchId,
            String workflowKey,
            String entityType,
            UUID entityId,
            UUID actorUserId,
            Map<String, Object> context) {
        WorkflowDefinitionEntity def = definitionRepository
                .findFirstByTenantIdAndWorkflowKeyAndActiveTrueAndDeletedAtIsNullOrderByVersionNoDesc(
                        tenantId, workflowKey)
                .orElse(null);
        if (def == null) {
            log.warn("No active workflow definition for key={} tenant={}", workflowKey, tenantId);
            return null;
        }

        Map<String, Object> ctx = context != null ? new HashMap<>(context) : new HashMap<>();
        if (branchId != null) {
            ctx.putIfAbsent("branchId", branchId.toString());
        }

        WorkflowInstanceEntity instance = new WorkflowInstanceEntity();
        instance.setTenantId(tenantId);
        instance.setHospitalId(hospitalId);
        instance.setDefinitionId(def.getId());
        instance.setWorkflowKey(workflowKey);
        instance.setStatus("RUNNING");
        instance.setEntityType(entityType);
        instance.setEntityId(entityId);
        instance.setContextJson(ctx);
        instance.setStartedAt(Instant.now());
        instance.setCreatedBy(actorUserId);
        instance.setUpdatedBy(actorUserId);
        instance = instanceRepository.save(instance);

        runSteps(def, instance, branchId, actorUserId);
        return instance;
    }

    @SuppressWarnings("unchecked")
    private void runSteps(
            WorkflowDefinitionEntity def,
            WorkflowInstanceEntity instance,
            UUID branchId,
            UUID actorUserId) {
        Object stepsObj = def.getDefinitionJson() != null ? def.getDefinitionJson().get("steps") : null;
        if (!(stepsObj instanceof List<?> steps) || steps.isEmpty()) {
            complete(instance, actorUserId);
            return;
        }

        for (Object stepObj : steps) {
            if (!(stepObj instanceof Map<?, ?> raw)) {
                continue;
            }
            Map<String, Object> step = (Map<String, Object>) raw;
            String key = stringVal(step.get("key"));
            String action = stringVal(step.get("action"));
            instance.setCurrentStepKey(key);

            if ("CREATE_TASK".equalsIgnoreCase(action)) {
                createTaskFromStep(instance, step, branchId, actorUserId);
            } else {
                log.debug("Skipping unsupported workflow action {} in {}", action, instance.getWorkflowKey());
            }
        }
        complete(instance, actorUserId);
    }

    private void createTaskFromStep(
            WorkflowInstanceEntity instance,
            Map<String, Object> step,
            UUID branchId,
            UUID actorUserId) {
        String taskType = stringVal(step.get("taskType"));
        if (taskType == null || taskType.isBlank()) {
            taskType = TaskTypes.HOUSEKEEPING_BED_CLEAN;
        }
        Map<String, Object> ctx = instance.getContextJson() != null ? instance.getContextJson() : Map.of();
        String bedLabel = stringVal(ctx.get("bedId"));
        if (bedLabel == null) {
            bedLabel = stringVal(ctx.get("fromBedId"));
        }
        UUID patientId = uuidVal(ctx.get("patientId"));
        UUID encounterId = uuidVal(ctx.get("encounterId"));
        UUID resolvedBranch = branchId != null ? branchId : uuidVal(ctx.get("branchId"));
        UUID sourceEventId = uuidVal(ctx.get("sourceEventId"));

        taskService.createTask(TaskService.CreateTaskCommand.builder()
                .tenantId(instance.getTenantId())
                .hospitalId(instance.getHospitalId())
                .branchId(resolvedBranch)
                .taskType(taskType)
                .title("Clean bed after turnaround")
                .description("Sanitize bed " + (bedLabel != null ? bedLabel : "released bed")
                        + " and mark AVAILABLE when ready. (workflow " + instance.getWorkflowKey() + ")")
                .priority("HIGH")
                .patientId(patientId)
                .encounterId(encounterId)
                .assignedRole("HOSPITAL_ADMIN")
                .createdByUserId(actorUserId)
                .sourceEventId(sourceEventId)
                .sourceEventType(stringVal(ctx.get("sourceEventType")))
                .sourceEntityType(instance.getEntityType())
                .sourceEntityId(instance.getEntityId())
                .dueAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .build());
    }

    private void complete(WorkflowInstanceEntity instance, UUID actorUserId) {
        instance.setStatus("COMPLETED");
        instance.setCompletedAt(Instant.now());
        instance.setUpdatedBy(actorUserId);
        instanceRepository.save(instance);
    }

    private static String stringVal(Object o) {
        return o == null ? null : o.toString();
    }

    private static UUID uuidVal(Object o) {
        if (o == null) {
            return null;
        }
        try {
            return UUID.fromString(o.toString());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
