package com.health360.automation.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ApprovalRequestResponse {
    private UUID id;
    private UUID hospitalId;
    private String approvalType;
    private String status;
    private String entityType;
    private UUID entityId;
    private UUID requestedBy;
    private UUID decidedBy;
    private Instant decidedAt;
    private String decisionNote;
    private Instant createdAt;
}
