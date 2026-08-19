package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IcuDashboardResponse {
    UUID hospitalId;
    UUID branchId;
    String hospitalName;
    String branchName;
    long activeStays;
    long availableBeds;
    long occupiedBeds;
    long totalBeds;
}
