package com.health360.iam.presentation.dto.request;

import com.health360.iam.domain.OnboardingRequestType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOnboardingRequestRequest {

    @NotNull
    private OnboardingRequestType requestType;

    @Size(max = 255)
    private String organizationName;

    @NotBlank
    @Size(min = 1, max = 200)
    private String contactName;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Pattern(regexp = "^(\\+?[1-9]\\d{9,14}|[6-9]\\d{9})$", message = "Invalid phone number")
    private String phone;

    @Size(max = 120)
    private String city;

    @Size(max = 120)
    private String specialty;

    @Size(max = 2000)
    private String message;
}
