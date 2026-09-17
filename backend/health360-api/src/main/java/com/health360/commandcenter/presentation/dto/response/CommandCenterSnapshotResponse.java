package com.health360.commandcenter.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CommandCenterSnapshotResponse {
    long bedsAvailable;
    long bedsOccupied;
    long bedsCleaning;
    long edActiveVisits;
    long openTasks;
    long overdueTasks;
    long pendingApprovals;
    long openFacilityWorkOrders;
    long openBloodRequests;
    long pendingLeaveRequests;
    long lowStockItems;
    long activePredictiveInsights;
    long criticalPredictiveInsights;
}
