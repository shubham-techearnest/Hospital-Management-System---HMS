package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class FamilyMemberRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String relationship;

    private LocalDate dateOfBirth;

    @Size(max = 30)
    private String gender;

    private List<@Size(max = 100) String> hereditaryConditions;

    private Boolean alive;
}
