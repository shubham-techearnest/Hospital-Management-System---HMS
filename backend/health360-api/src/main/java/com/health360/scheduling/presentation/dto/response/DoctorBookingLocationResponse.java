package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class DoctorBookingLocationResponse {
    UUID hospitalId;
    String hospitalName;
    UUID branchId;
    String branchName;
    String city;
}
