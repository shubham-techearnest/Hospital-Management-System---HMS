package com.health360.blood.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateBloodRequestRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID patientId;

    private UUID encounterId;
    private UUID admissionId;
    private UUID ipdBloodRequestId;

    @Size(max = 40)
    private String productType;

    @NotBlank
    @Size(max = 10)
    private String bloodGroup;

    @Min(1)
    @Max(20)
    private Integer unitsRequested;

    @Size(max = 20)
    private String urgency;

    @Size(max = 2000)
    private String indication;

    @Size(max = 2000)
    private String notes;
}
