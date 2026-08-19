package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PatientClinicalDashboardResponse {
    UUID patientId;
    long totalEncounters;
    long activeEncounters;
    long completedEncounters;
    List<RecentEncounterSummary> recentEncounters;

    @Value
    @Builder
    public static class RecentEncounterSummary {
        UUID encounterId;
        String encounterNumber;
        UUID hospitalId;
        String status;
        String encounterType;
        Instant createdAt;
    }
}
