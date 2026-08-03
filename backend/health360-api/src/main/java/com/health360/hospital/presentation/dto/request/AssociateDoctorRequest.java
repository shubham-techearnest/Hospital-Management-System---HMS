package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

import java.util.UUID;

@Value
public class AssociateDoctorRequest {
    @NotNull UUID doctorId;
    UUID branchId;
    UUID departmentId;
}
