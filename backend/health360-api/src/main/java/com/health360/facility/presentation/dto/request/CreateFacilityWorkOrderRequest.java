package com.health360.facility.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CreateFacilityWorkOrderRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotBlank
    @Size(max = 30)
    private String workType;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    @Size(max = 20)
    private String priority;

    @Size(max = 200)
    private String locationLabel;

    private UUID bedId;
    private UUID patientId;
    private UUID encounterId;
    private UUID admissionId;
    private Instant requestedForAt;
}
