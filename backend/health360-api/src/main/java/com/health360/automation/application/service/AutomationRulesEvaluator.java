package com.health360.automation.application.service;

import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.automation.infrastructure.persistence.entity.HospitalEventEntity;
import com.health360.tasks.application.service.TaskService;
import com.health360.workflow.application.service.WorkflowRuntimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * v1 rules evaluator: event-type → ordered automation actions.
 * Kept in-code for HMS-12; later can load from DB rule tables.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationRulesEvaluator {

    public enum ActionType {
        CREATE_TASK,
        START_WORKFLOW
    }

    public record RuleAction(ActionType type, String taskType, String assignedRole, String title,
                             String description, String priority, long dueMinutes,
                             String workflowKey) {}

    private final TaskService taskService;
    private final WorkflowRuntimeService workflowRuntimeService;

    @Transactional
    public void evaluate(HospitalEventEntity event) {
        for (RuleAction action : rulesFor(event.getEventType())) {
            apply(event, action);
        }
    }

    private List<RuleAction> rulesFor(String eventType) {
        return switch (eventType) {
            case HospitalEventTypes.ADMISSION_REQUESTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_ADMISSION_REQUEST,
                            "HOSPITAL_ADMIN", "Review admission request",
                            "Review and approve/reject the pending IPD admission request.",
                            "HIGH", 240, null));
            case HospitalEventTypes.ADMISSION_APPROVED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.RESERVE_BED,
                            "HOSPITAL_ADMIN", "Reserve bed for approved admission",
                            "Allocate/reserve a bed for the approved admission request.",
                            "HIGH", 120, null));
            case HospitalEventTypes.PATIENT_ADMITTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.NURSING_ADMIT_ORIENTATION,
                            "NURSE", "Complete admission orientation",
                            "Orient patient/family, verify ID band, baseline vitals, and admit checklist.",
                            "NORMAL", 120, null));
            case HospitalEventTypes.PATIENT_DISCHARGED -> List.of(
                    new RuleAction(ActionType.START_WORKFLOW, null, null, null, null, null, 0,
                            WorkflowRuntimeService.DISCHARGE_HOUSEKEEPING));
            case HospitalEventTypes.BED_RELEASED, HospitalEventTypes.PATIENT_TRANSFERRED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.HOUSEKEEPING_BED_CLEAN,
                            "HOSPITAL_ADMIN", "Clean bed after turnaround",
                            "Sanitize released bed and mark AVAILABLE when ready.",
                            "HIGH", 60, null));
            case HospitalEventTypes.CRITICAL_RESULT -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_CRITICAL_LAB,
                            "DOCTOR", "Acknowledge critical lab result",
                            "Review and acknowledge critical laboratory findings.",
                            "URGENT", 30, null));
            case HospitalEventTypes.ED_TRIAGED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.ED_TRIAGE,
                            "NURSE", "ED care after triage",
                            "Start ED assessment/treatment for the triaged patient.",
                            "HIGH", 60, null));
            case HospitalEventTypes.STOCK_LOW -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_LOW_STOCK,
                            "HOSPITAL_ADMIN", "Review low stock item",
                            "Review reorder level and raise purchase request if needed.",
                            "NORMAL", 480, null));
            case HospitalEventTypes.PURCHASE_REQUESTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.APPROVE_PURCHASE_REQUEST,
                            "HOSPITAL_ADMIN", "Approve purchase request",
                            "Review and approve/reject the submitted purchase request.",
                            "HIGH", 240, null));
            case HospitalEventTypes.ASSET_BROKEN -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.ASSET_BREAKDOWN_REPAIR,
                            "ASSET_MANAGER", "Repair broken asset",
                            "Investigate breakdown and complete the maintenance ticket.",
                            "URGENT", 120, null));
            case HospitalEventTypes.MAINTENANCE_DUE -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.ASSET_PM_DUE,
                            "ASSET_MANAGER", "Perform due asset maintenance",
                            "Complete scheduled preventive maintenance or calibration.",
                            "HIGH", 480, null));
            case HospitalEventTypes.DIET_ORDERED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.FACILITY_DIETARY,
                            "HOSPITAL_ADMIN", "Prepare and deliver diet",
                            "Prepare ordered meal and deliver to the patient location.",
                            "NORMAL", 60, null));
            case HospitalEventTypes.LINEN_COLLECTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.FACILITY_LAUNDRY,
                            "HOSPITAL_ADMIN", "Process laundry cycle",
                            "Collect, wash, and return linen for the request.",
                            "NORMAL", 240, null));
            case HospitalEventTypes.TRANSPORT_REQUESTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.FACILITY_TRANSPORT,
                            "HOSPITAL_ADMIN", "Patient / specimen transport",
                            "Complete the requested transport movement.",
                            "HIGH", 45, null));
            case HospitalEventTypes.PRE_AUTH_REQUESTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_PRE_AUTH,
                            "HOSPITAL_ADMIN", "Review insurance pre-authorization",
                            "Review and approve/reject the pending insurance pre-auth request.",
                            "HIGH", 240, null));
            case HospitalEventTypes.CLAIM_SUBMITTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_INSURANCE_CLAIM,
                            "HOSPITAL_ADMIN", "Review insurance claim",
                            "Review submitted claim and approve, reject, or settle.",
                            "HIGH", 480, null));
            case HospitalEventTypes.BLOOD_REQUESTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_BLOOD_REQUEST,
                            "HOSPITAL_ADMIN", "Review blood / transfusion request",
                            "Cross-match and approve or reject the transfusion request.",
                            "HIGH", 60, null));
            case HospitalEventTypes.BLOOD_ISSUED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.ISSUE_BLOOD_UNIT,
                            "HOSPITAL_ADMIN", "Monitor issued blood unit",
                            "Confirm transfusion completion or return unused unit to stock.",
                            "NORMAL", 240, null));
            case HospitalEventTypes.LEAVE_REQUESTED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_LEAVE_REQUEST,
                            "HOSPITAL_ADMIN", "Review staff leave request",
                            "Approve or reject the pending leave request.",
                            "NORMAL", 480, null));
            case HospitalEventTypes.PREDICTIVE_INSIGHT_RAISED -> List.of(
                    new RuleAction(ActionType.CREATE_TASK, TaskTypes.REVIEW_PREDICTIVE_ALERT,
                            "HOSPITAL_ADMIN", "Review predictive ops alert",
                            "Review the critical predictive insight and take mitigating action.",
                            "HIGH", 120, null));
            case HospitalEventTypes.FACILITY_WORK_CREATED -> {
                // HOUSEKEEPING auto-orders already get My Work via BED_RELEASED task; skip duplicate.
                yield List.of();
            }
            default -> List.of();
        };
    }

    private void apply(HospitalEventEntity event, RuleAction action) {
        switch (action.type()) {
            case CREATE_TASK -> createTask(event, action);
            case START_WORKFLOW -> startWorkflow(event, action.workflowKey());
        }
    }

    private void createTask(HospitalEventEntity event, RuleAction action) {
        Object bedId = event.getPayload() != null ? event.getPayload().get("bedId") : null;
        if (bedId == null && event.getPayload() != null) {
            bedId = event.getPayload().get("fromBedId");
        }
        String description = action.description();
        if (TaskTypes.HOUSEKEEPING_BED_CLEAN.equals(action.taskType()) && bedId != null) {
            description = "Sanitize bed " + bedId + " and mark AVAILABLE when ready.";
        }

        taskService.createTask(TaskService.CreateTaskCommand.builder()
                .tenantId(event.getTenantId())
                .hospitalId(event.getHospitalId())
                .branchId(event.getBranchId())
                .taskType(action.taskType())
                .title(action.title())
                .description(description)
                .priority(action.priority())
                .patientId(event.getPatientId())
                .encounterId(event.getEncounterId())
                .assignedRole(action.assignedRole())
                .createdByUserId(event.getUserId())
                .sourceEventId(event.getId())
                .sourceEventType(event.getEventType())
                .sourceEntityType(event.getEntityType())
                .sourceEntityId(event.getEntityId())
                .dueAt(Instant.now().plus(action.dueMinutes(), ChronoUnit.MINUTES))
                .build());
    }

    private void startWorkflow(HospitalEventEntity event, String workflowKey) {
        Map<String, Object> ctx = new HashMap<>();
        if (event.getPayload() != null) {
            ctx.putAll(event.getPayload());
        }
        if (event.getPatientId() != null) {
            ctx.put("patientId", event.getPatientId().toString());
        }
        if (event.getEncounterId() != null) {
            ctx.put("encounterId", event.getEncounterId().toString());
        }
        ctx.put("sourceEventId", event.getId().toString());
        ctx.put("sourceEventType", event.getEventType());

        var started = workflowRuntimeService.start(
                event.getTenantId(),
                event.getHospitalId(),
                event.getBranchId(),
                workflowKey,
                event.getEntityType(),
                event.getEntityId(),
                event.getUserId(),
                ctx);
        if (started == null) {
            log.warn("Workflow {} missing for tenant {}; falling back to housekeeping task",
                    workflowKey, event.getTenantId());
            createTask(event, new RuleAction(ActionType.CREATE_TASK, TaskTypes.HOUSEKEEPING_BED_CLEAN,
                    "HOSPITAL_ADMIN", "Clean bed after turnaround",
                    "Sanitize released bed and mark AVAILABLE when ready.",
                    "HIGH", 60, null));
        }
    }
}
