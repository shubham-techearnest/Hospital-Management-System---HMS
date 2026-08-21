package com.health360.opd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class OpdDoctorOptionResponse {
    UUID doctorId;
    String doctorName;
    String specialization;
    UUID branchId;
    String status;
}
