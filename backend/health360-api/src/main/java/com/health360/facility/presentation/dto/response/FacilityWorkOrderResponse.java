package com.health360.facility.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class FacilityWorkOrderResponse {
    UUID workOrderId;
    UUID hospitalId;
    UUID branchId;
    String workNumber;
    String workType;
    String status;
    String priority;
    String title;
    String description;
    String locationLabel;
    UUID bedId;
    UUID patientId;
    UUID encounterId;
    UUID admissionId;
    Instant requestedForAt;
    Instant openedAt;
    Instant startedAt;
    Instant completedAt;
    UUID completedBy;
    String resolutionNotes;
    String sourceEventType;
}
