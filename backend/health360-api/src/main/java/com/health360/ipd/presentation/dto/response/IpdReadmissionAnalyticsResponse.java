package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdReadmissionAnalyticsResponse {
    int windowDays;
    long readmissionCount;
    java.util.List<Item> items;

    @Value
    @Builder
    public static class Item {
        UUID admissionId;
        UUID priorAdmissionId;
        UUID patientId;
        String admissionNumber;
        Instant admittedAt;
        Instant priorDischargedAt;
    }
}
