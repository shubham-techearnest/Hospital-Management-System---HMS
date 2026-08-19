package com.health360.dashboard.application.service;

import java.util.UUID;

public record DashboardScope(
        UUID hospitalId,
        UUID branchId,
        String hospitalName,
        String branchName
) {
}
