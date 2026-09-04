package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdminDashboardResponse {
    long pendingVerifications;
    long registeredUsers;
    long visibleReviews;
    long hiddenReviews;
    long hospitalCount;
}
