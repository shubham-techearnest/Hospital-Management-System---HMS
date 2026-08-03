package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class DepartmentResponse {
    UUID id;
    String name;
    String description;
    String floor;
    UUID headDoctorId;
    boolean active;
}
