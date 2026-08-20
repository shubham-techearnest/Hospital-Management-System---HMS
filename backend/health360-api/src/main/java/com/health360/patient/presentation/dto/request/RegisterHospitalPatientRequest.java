package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterHospitalPatientRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String legalFirstName;

    @NotBlank
    @Size(min = 2, max = 100)
    private String legalLastName;

    @NotNull
    @Past
    private LocalDate dateOfBirth;

    @NotBlank
    private String gender;

    @NotBlank
    private String primaryPhone;

    private String secondaryPhone;
    private String bloodGroup;
    private String permanentAddressLine1;
    private String permanentAddressLine2;
    private String permanentCity;
    private String permanentState;
    private String permanentPincode;
    private String permanentCountry;

    private boolean duplicateOverride;
    private String duplicateOverrideReason;
}
