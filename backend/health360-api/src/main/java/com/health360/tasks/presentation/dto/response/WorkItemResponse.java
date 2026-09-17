package com.health360.tasks.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class WorkItemResponse {
    private UUID id;
    private UUID hospitalId;
    private UUID branchId;
    private String taskType;
    private String title;
    private String description;
    private String priority;
    private String status;
    private UUID patientId;
    private UUID encounterId;
    private UUID assignedUserId;
    private String assignedRole;
    private String sourceEventType;
    private String sourceEntityType;
    private UUID sourceEntityId;
    private Instant dueAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant createdAt;
}
