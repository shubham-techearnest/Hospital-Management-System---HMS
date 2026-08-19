package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class StaffResponse {
    UUID staffId;
    UUID userId;
    String email;
    String firstName;
    String lastName;
    UUID hospitalId;
    UUID branchId;
    UUID departmentId;
    String jobTitle;
    String employmentStatus;
    Instant hiredAt;
    List<String> roles;
}
