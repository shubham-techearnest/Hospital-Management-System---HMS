package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IpdDashboardResponse {
    UUID hospitalId;
    UUID branchId;
    String hospitalName;
    String branchName;
    long activeAdmissions;
    long availableBeds;
    long occupiedBeds;
    long cleaningBeds;
    long reservedBeds;
    long totalBeds;
    /** Occupancy percent of total beds (0–100). */
    double occupancyPercent;
    long openAdmissionRequests;
    long activeDischargeOrders;
    /** Average length of stay in hours for discharges in the metrics window. */
    Double averageLosHours;
    /** Average bed cleaning turnaround in hours (cleaning_started_at → cleaned_at). */
    Double averageTurnaroundHours;
    /** Average hours from discharge order to actual discharge. */
    Double averageDischargeDelayHours;
    /** Average hours from payer auth request to decision. */
    Double averageAuthDelayHours;
    int metricsWindowDays;
    long dischargesInWindow;
    long readmissionsInWindow;
}
