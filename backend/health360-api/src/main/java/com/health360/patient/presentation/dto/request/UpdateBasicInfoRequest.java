package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateBasicInfoRequest {

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 30)
    private String gender;

    @Size(max = 5)
    private String bloodGroup;

    @Size(max = 20)
    private String maritalStatus;

    @Size(min = 2, max = 2)
    private String nationality;

    @Size(max = 500)
    private String profilePhotoUrl;
}
