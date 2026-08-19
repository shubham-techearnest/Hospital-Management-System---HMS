package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class HospitalDashboardResponse {
    UUID hospitalId;
    UUID branchId;
    String hospitalName;
    String branchName;
    int branchCount;
    int departmentCount;
    int doctorCount;
    int activeStaffCount;
    long totalEncounters;
    long opdWaitingToday;
    long opdInProgressToday;
    long activeIpdAdmissions;
    long activeIcuStays;
    long pendingLabOrders;
    long pendingRadiologyOrders;
    long pendingPharmacyOrders;
    long pendingOtProcedures;
}
