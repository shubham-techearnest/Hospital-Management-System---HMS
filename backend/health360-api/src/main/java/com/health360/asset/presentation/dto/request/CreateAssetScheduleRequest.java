package com.health360.asset.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CreateAssetScheduleRequest {

    @NotNull
    private UUID assetId;

    @NotBlank
    @Size(max = 30)
    private String scheduleType;

    @NotBlank
    @Size(max = 30)
    private String cadence;

    private Integer intervalDays;

    private Instant nextDueAt;

    @Size(max = 2000)
    private String notes;
}
