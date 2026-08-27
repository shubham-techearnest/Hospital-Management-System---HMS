package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class DoctorBookingLocationResponse {
    UUID hospitalId;
    String hospitalName;
    UUID branchId;
    String branchName;
    String city;
    String doctorName;
    String specialization;
    /** Human-readable OPD windows, e.g. "Mon 09:00–13:00". */
    List<String> opdHours;
}
