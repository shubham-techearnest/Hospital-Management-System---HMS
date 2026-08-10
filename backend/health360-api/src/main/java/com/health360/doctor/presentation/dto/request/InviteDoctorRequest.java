package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class InviteDoctorRequest {

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Size(min = 1, max = 100)
    @Pattern(regexp = "^[\\p{L} .'-]+$", message = "First name contains invalid characters")
    private String firstName;

    @NotBlank
    @Size(min = 1, max = 100)
    private String lastName;

    @NotBlank
    @Pattern(regexp = "^(\\+?[1-9]\\d{9,14}|[6-9]\\d{9})$", message = "Invalid phone number")
    private String phone;

    /** Optional — a secure temporary password is generated when omitted. */
    @Size(min = 8, max = 128)
    private String password;

    private UUID branchId;
    private UUID departmentId;
}
