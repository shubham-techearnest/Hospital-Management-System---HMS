package com.health360.insurance.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateInsurancePayerRequest {

    @NotNull
    private UUID hospitalId;

    @NotBlank
    @Size(max = 40)
    private String code;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 30)
    private String payerType;

    @Size(max = 30)
    private String contactPhone;

    @Size(max = 120)
    private String contactEmail;

    @Size(max = 2000)
    private String notes;
}
