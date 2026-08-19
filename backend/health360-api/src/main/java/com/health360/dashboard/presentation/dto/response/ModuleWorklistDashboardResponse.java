package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class ModuleWorklistDashboardResponse {
    UUID hospitalId;
    UUID branchId;
    String hospitalName;
    String branchName;
    long pendingWorklistCount;
    long receivedCount;
    long inProgressCount;
    long completedCount;
}
