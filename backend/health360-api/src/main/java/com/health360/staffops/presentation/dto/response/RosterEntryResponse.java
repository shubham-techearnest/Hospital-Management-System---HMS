package com.health360.staffops.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class RosterEntryResponse {
    UUID rosterEntryId;
    UUID hospitalId;
    UUID branchId;
    UUID staffId;
    UUID shiftId;
    String shiftCode;
    String shiftName;
    LocalDate dutyDate;
    String status;
    String notes;
}
