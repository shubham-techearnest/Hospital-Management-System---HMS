package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class OpdDashboardResponse {
    UUID hospitalId;
    UUID branchId;
    String hospitalName;
    String branchName;
    LocalDate queueDate;
    long deskCount;
    long waitingCount;
    long calledCount;
    long inServiceCount;
    long completedTodayCount;
    long totalTodayCount;
}
