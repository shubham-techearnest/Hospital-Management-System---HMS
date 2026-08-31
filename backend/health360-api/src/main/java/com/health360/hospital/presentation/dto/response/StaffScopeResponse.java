package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class StaffScopeResponse {
    UUID hospitalId;
    UUID branchId;
    String hospitalName;
    String branchName;
    List<String> roles;
    boolean hospitalWide;
}
