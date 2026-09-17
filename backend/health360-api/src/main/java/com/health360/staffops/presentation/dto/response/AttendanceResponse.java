package com.health360.staffops.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class AttendanceResponse {
    UUID attendanceId;
    UUID hospitalId;
    UUID branchId;
    UUID staffId;
    UUID rosterEntryId;
    LocalDate dutyDate;
    String status;
    Instant clockIn;
    Instant clockOut;
    String notes;
}
