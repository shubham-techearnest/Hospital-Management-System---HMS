package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

import java.util.UUID;

@Value
public class CreateHospitalAssociationRequest {
    @NotNull UUID hospitalId;
    UUID branchId;
    UUID departmentId;
}
