package com.health360.staffops.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class LeaveRequestResponse {
    UUID leaveRequestId;
    UUID hospitalId;
    UUID branchId;
    UUID staffId;
    String leaveType;
    LocalDate startDate;
    LocalDate endDate;
    String status;
    String reason;
    String decisionNotes;
    Instant requestedAt;
    Instant decidedAt;
}
