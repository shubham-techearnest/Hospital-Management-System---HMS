package com.health360.analytics.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsRecalculationService {

    private final HealthDashboardService healthDashboardService;

    public void recalculate(UUID userId, UUID tenantId) {
        try {
            healthDashboardService.calculateAndPersist(userId, tenantId);
        } catch (Exception ex) {
            log.warn("Metrics recalculation failed for user {} tenant {}: {}", userId, tenantId, ex.getMessage());
        }
    }
}
