package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmergencyContactRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String relationship;

    @NotBlank
    @Size(max = 20)
    private String phone;

    @Email
    @Size(max = 255)
    private String email;

    private Boolean primary;
}
