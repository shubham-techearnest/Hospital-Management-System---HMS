package com.health360.tasks.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.tasks.infrastructure.persistence.entity.WorkItemEntity;
import com.health360.tasks.infrastructure.persistence.repository.WorkItemRepository;
import com.health360.tasks.presentation.dto.request.UpdateWorkItemStatusRequest;
import com.health360.tasks.presentation.dto.response.MyWorkSummaryResponse;
import com.health360.tasks.presentation.dto.response.WorkItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private static final Set<String> OPEN_STATUSES = Set.of("PENDING", "ASSIGNED", "IN_PROGRESS", "BLOCKED");

    private final WorkItemRepository workItemRepository;
    private final TaskAccessService accessService;

    @Transactional
    public WorkItemEntity createTask(CreateTaskCommand command) {
        WorkItemEntity item = new WorkItemEntity();
        item.setTenantId(command.tenantId());
        item.setHospitalId(command.hospitalId());
        item.setBranchId(command.branchId());
        item.setDepartmentId(command.departmentId());
        item.setTaskType(command.taskType());
        item.setTitle(command.title());
        item.setDescription(command.description());
        item.setPriority(command.priority() != null ? command.priority() : "NORMAL");
        item.setStatus(command.assignedUserId() != null ? "ASSIGNED" : "PENDING");
        item.setPatientId(command.patientId());
        item.setEncounterId(command.encounterId());
        item.setAssetId(command.assetId());
        item.setAssignedUserId(command.assignedUserId());
        item.setAssignedRole(command.assignedRole());
        item.setCreatedByUserId(command.createdByUserId());
        item.setSourceEventId(command.sourceEventId());
        item.setSourceEventType(command.sourceEventType());
        item.setSourceEntityType(command.sourceEntityType());
        item.setSourceEntityId(command.sourceEntityId());
        item.setDueAt(command.dueAt());
        item.setCreatedBy(command.createdByUserId());
        item.setUpdatedBy(command.createdByUserId());
        return workItemRepository.save(item);
    }

    @Transactional
    public int completeOpenTasksForEntity(
            UUID tenantId,
            String sourceEntityType,
            UUID sourceEntityId,
            String taskType,
            UUID actorUserId) {
        List<WorkItemEntity> open = workItemRepository
                .findByTenantIdAndSourceEntityTypeAndSourceEntityIdAndTaskTypeAndStatusInAndDeletedAtIsNull(
                        tenantId, sourceEntityType, sourceEntityId, taskType, OPEN_STATUSES);
        Instant now = Instant.now();
        for (WorkItemEntity item : open) {
            item.setStatus("COMPLETED");
            item.setCompletedAt(now);
            item.setUpdatedBy(actorUserId);
            workItemRepository.save(item);
        }
        return open.size();
    }

    @Transactional(readOnly = true)
    public Page<WorkItemResponse> listMyWork(
            UserPrincipal principal, UUID hospitalId, String status, String queue, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        accessService.assertModuleEnabled(principal, hospitalId);

        Set<String> roles = roleSet(principal);
        String queueKey = normalizeQueue(queue);
        if (queueKey != null) {
            Instant now = Instant.now();
            ZoneId zone = ZoneId.systemDefault();
            Instant dayStart = LocalDate.now(zone).atStartOfDay(zone).toInstant();
            Instant dayEnd = dayStart.plusSeconds(86_400);
            return workItemRepository.findMyWorkQueue(
                            principal.getTenantId(),
                            hospitalId,
                            principal.getUserId(),
                            roles,
                            OPEN_STATUSES,
                            queueKey,
                            now,
                            dayStart,
                            dayEnd,
                            pageable)
                    .map(this::toResponse);
        }

        String statusFilter = (status != null && !status.isBlank()) ? status.trim().toUpperCase(Locale.ROOT) : null;
        return workItemRepository.findMyWork(
                        principal.getTenantId(),
                        hospitalId,
                        principal.getUserId(),
                        roles,
                        statusFilter,
                        pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public MyWorkSummaryResponse myWorkSummary(UserPrincipal principal, UUID hospitalId) {
        accessService.assertCanRead(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        accessService.assertModuleEnabled(principal, hospitalId);

        Set<String> roles = roleSet(principal);
        Instant now = Instant.now();
        ZoneId zone = ZoneId.systemDefault();
        Instant dayStart = LocalDate.now(zone).atStartOfDay(zone).toInstant();
        Instant dayEnd = dayStart.plusSeconds(86_400);
        UUID tenantId = principal.getTenantId();
        UUID userId = principal.getUserId();

        return MyWorkSummaryResponse.builder()
                .urgent(workItemRepository.countMyWorkQueue(
                        tenantId, hospitalId, userId, roles, OPEN_STATUSES, "URGENT", now, dayStart, dayEnd))
                .today(workItemRepository.countMyWorkQueue(
                        tenantId, hospitalId, userId, roles, OPEN_STATUSES, "TODAY", now, dayStart, dayEnd))
                .overdue(workItemRepository.countMyWorkQueue(
                        tenantId, hospitalId, userId, roles, OPEN_STATUSES, "OVERDUE", now, dayStart, dayEnd))
                .pending(workItemRepository.countMyWorkQueue(
                        tenantId, hospitalId, userId, roles, OPEN_STATUSES, "PENDING", now, dayStart, dayEnd))
                .openTotal(workItemRepository.countMyWorkQueue(
                        tenantId, hospitalId, userId, roles, OPEN_STATUSES, "ALL", now, dayStart, dayEnd))
                .build();
    }

    private static Set<String> roleSet(UserPrincipal principal) {
        Set<String> roles = new HashSet<>(principal.getRoles());
        if (roles.isEmpty()) {
            roles.add("__none__");
        }
        return roles;
    }

    private static String normalizeQueue(String queue) {
        if (queue == null || queue.isBlank()) {
            return null;
        }
        String value = queue.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("URGENT", "TODAY", "OVERDUE", "PENDING", "ALL").contains(value)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "queue must be URGENT, TODAY, OVERDUE, PENDING, or ALL");
        }
        return value;
    }

    @Transactional(readOnly = true)
    public Page<WorkItemResponse> listHospitalTasks(
            UserPrincipal principal, UUID hospitalId, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        accessService.assertModuleEnabled(principal, hospitalId);
        return workItemRepository
                .findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public WorkItemResponse updateStatus(
            UserPrincipal principal, UUID taskId, UpdateWorkItemStatusRequest request) {
        accessService.assertCanWrite(principal);
        WorkItemEntity item = workItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(taskId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Task not found"));
        accessService.assertHospitalScope(principal, item.getHospitalId());
        accessService.assertModuleEnabled(principal, item.getHospitalId());

        String next = request.getStatus().trim().toUpperCase();
        validateTransition(item.getStatus(), next);

        Instant now = Instant.now();
        item.setStatus(next);
        if ("IN_PROGRESS".equals(next) && item.getStartedAt() == null) {
            item.setStartedAt(now);
            if (item.getAssignedUserId() == null) {
                item.setAssignedUserId(principal.getUserId());
            }
        }
        if ("COMPLETED".equals(next) || "CANCELLED".equals(next)) {
            item.setCompletedAt(now);
        }
        item.setUpdatedBy(principal.getUserId());
        return toResponse(workItemRepository.save(item));
    }

    private void validateTransition(String current, String next) {
        if (current.equals(next)) {
            return;
        }
        if ("COMPLETED".equals(current) || "CANCELLED".equals(current)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Closed tasks cannot change status");
        }
        if (!Set.of("PENDING", "ASSIGNED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED").contains(next)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid task status");
        }
        if ("COMPLETED".equals(next) && !OPEN_STATUSES.contains(current) && !"IN_PROGRESS".equals(current)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Cannot complete task from status " + current);
        }
    }

    private WorkItemResponse toResponse(WorkItemEntity e) {
        WorkItemResponse r = new WorkItemResponse();
        r.setId(e.getId());
        r.setHospitalId(e.getHospitalId());
        r.setBranchId(e.getBranchId());
        r.setTaskType(e.getTaskType());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setPriority(e.getPriority());
        r.setStatus(e.getStatus());
        r.setPatientId(e.getPatientId());
        r.setEncounterId(e.getEncounterId());
        r.setAssignedUserId(e.getAssignedUserId());
        r.setAssignedRole(e.getAssignedRole());
        r.setSourceEventType(e.getSourceEventType());
        r.setSourceEntityType(e.getSourceEntityType());
        r.setSourceEntityId(e.getSourceEntityId());
        r.setDueAt(e.getDueAt());
        r.setStartedAt(e.getStartedAt());
        r.setCompletedAt(e.getCompletedAt());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }

    public record CreateTaskCommand(
            UUID tenantId,
            UUID hospitalId,
            UUID branchId,
            UUID departmentId,
            String taskType,
            String title,
            String description,
            String priority,
            UUID patientId,
            UUID encounterId,
            UUID assetId,
            UUID assignedUserId,
            String assignedRole,
            UUID createdByUserId,
            UUID sourceEventId,
            String sourceEventType,
            String sourceEntityType,
            UUID sourceEntityId,
            Instant dueAt
    ) {
        public static Builder builder() {
            return new Builder();
        }

        public static final class Builder {
            private UUID tenantId;
            private UUID hospitalId;
            private UUID branchId;
            private UUID departmentId;
            private String taskType;
            private String title;
            private String description;
            private String priority;
            private UUID patientId;
            private UUID encounterId;
            private UUID assetId;
            private UUID assignedUserId;
            private String assignedRole;
            private UUID createdByUserId;
            private UUID sourceEventId;
            private String sourceEventType;
            private String sourceEntityType;
            private UUID sourceEntityId;
            private Instant dueAt;

            public Builder tenantId(UUID v) { this.tenantId = v; return this; }
            public Builder hospitalId(UUID v) { this.hospitalId = v; return this; }
            public Builder branchId(UUID v) { this.branchId = v; return this; }
            public Builder departmentId(UUID v) { this.departmentId = v; return this; }
            public Builder taskType(String v) { this.taskType = v; return this; }
            public Builder title(String v) { this.title = v; return this; }
            public Builder description(String v) { this.description = v; return this; }
            public Builder priority(String v) { this.priority = v; return this; }
            public Builder patientId(UUID v) { this.patientId = v; return this; }
            public Builder encounterId(UUID v) { this.encounterId = v; return this; }
            public Builder assetId(UUID v) { this.assetId = v; return this; }
            public Builder assignedUserId(UUID v) { this.assignedUserId = v; return this; }
            public Builder assignedRole(String v) { this.assignedRole = v; return this; }
            public Builder createdByUserId(UUID v) { this.createdByUserId = v; return this; }
            public Builder sourceEventId(UUID v) { this.sourceEventId = v; return this; }
            public Builder sourceEventType(String v) { this.sourceEventType = v; return this; }
            public Builder sourceEntityType(String v) { this.sourceEntityType = v; return this; }
            public Builder sourceEntityId(UUID v) { this.sourceEntityId = v; return this; }
            public Builder dueAt(Instant v) { this.dueAt = v; return this; }

            public CreateTaskCommand build() {
                return new CreateTaskCommand(
                        tenantId, hospitalId, branchId, departmentId, taskType, title, description,
                        priority, patientId, encounterId, assetId, assignedUserId, assignedRole,
                        createdByUserId, sourceEventId, sourceEventType, sourceEntityType,
                        sourceEntityId, dueAt);
            }
        }
    }
}
