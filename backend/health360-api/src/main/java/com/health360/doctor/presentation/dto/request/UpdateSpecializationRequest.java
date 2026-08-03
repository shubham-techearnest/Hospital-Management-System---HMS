package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateSpecializationRequest {

    @NotNull
    private UUID primarySpecializationId;

    private List<UUID> subSpecializationIds;
}
