package com.health360.staffops.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalTime;
import java.util.UUID;

@Value
@Builder
public class StaffShiftResponse {
    UUID shiftId;
    UUID hospitalId;
    UUID branchId;
    String code;
    String name;
    LocalTime startTime;
    LocalTime endTime;
    boolean active;
    String notes;
}
