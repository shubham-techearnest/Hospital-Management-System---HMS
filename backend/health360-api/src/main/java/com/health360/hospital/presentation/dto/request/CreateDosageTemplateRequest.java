package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateDosageTemplateRequest {

    @NotNull
    private UUID hospitalId;

    private UUID branchId;

    @NotBlank
    @Size(max = 120)
    private String label;

    @Size(max = 120)
    private String doseText;

    @Size(max = 40)
    private String route;

    @Size(max = 120)
    private String frequency;

    private Integer durationDays;
}
