package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class HospitalAssociationResponse {
    UUID id;
    UUID hospitalId;
    String hospitalName;
    UUID branchId;
    String branchName;
    UUID departmentId;
    String departmentName;
    String status;
}
