package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateBasicInfoRequest {

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 30)
    private String gender;

    @Size(max = 20)
    private String bloodGroup;

    @Size(max = 20)
    private String maritalStatus;

    @Pattern(regexp = "^$|^[A-Z]{2}$", message = "Nationality must be a 2-letter ISO code")
    private String nationality;

    @Size(max = 500)
    private String profilePhotoUrl;
}
