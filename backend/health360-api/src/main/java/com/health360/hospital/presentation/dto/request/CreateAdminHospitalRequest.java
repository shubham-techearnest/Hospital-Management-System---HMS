package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAdminHospitalRequest {

    @NotBlank
    @Size(max = 300)
    private String name;

    @NotBlank
    @Size(max = 100)
    private String registrationNumber;

    @NotBlank
    private String hospitalType;

    private Integer establishedYear;
    private Integer totalBedCount;
    private String accreditation;

    @Size(max = 5000)
    private String description;

    @NotBlank
    @Email
    @Size(max = 255)
    private String adminEmail;

    @NotBlank
    @Size(min = 1, max = 100)
    @Pattern(regexp = "^[\\p{L} .'-]+$", message = "First name contains invalid characters")
    private String adminFirstName;

    @NotBlank
    @Size(min = 1, max = 100)
    private String adminLastName;

    @NotBlank
    @Pattern(regexp = "^(\\+?[1-9]\\d{9,14}|[6-9]\\d{9})$", message = "Invalid phone number")
    private String adminPhone;

    /** Optional — a secure temporary password is generated when omitted. */
    @Size(min = 8, max = 128)
    private String adminPassword;

    /** Subscription plan code; defaults to FREE when omitted. */
    @Size(max = 50)
    private String planCode;
}
