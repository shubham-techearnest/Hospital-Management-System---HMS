package com.health360.blood.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ReceiveBloodUnitRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotBlank
    @Size(max = 40)
    private String unitNumber;

    @Size(max = 40)
    private String productType;

    @NotBlank
    @Size(max = 10)
    private String bloodGroup;

    private Instant collectedAt;
    private Instant expiresAt;

    @Size(max = 80)
    private String donorRef;

    @Size(max = 2000)
    private String notes;
}
