package com.health360.asset.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AssetMaintenanceTicketResponse {
    UUID ticketId;
    UUID assetId;
    UUID scheduleId;
    String ticketNumber;
    String ticketType;
    String status;
    String priority;
    String title;
    String description;
    UUID reportedBy;
    String assignedRole;
    Instant openedAt;
    Instant completedAt;
    UUID completedBy;
    String resolutionNotes;
}
