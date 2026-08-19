package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class DoctorDashboardResponse {
    UUID doctorId;
    long inProgressEncounters;
    long waitingEncounters;
    long upcomingAppointments;
    List<RecentEncounterSummary> recentEncounters;

    @Value
    @Builder
    public static class RecentEncounterSummary {
        UUID encounterId;
        String encounterNumber;
        UUID patientId;
        String status;
        String encounterType;
        Instant createdAt;
    }
}
