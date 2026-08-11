package com.health360.iam.presentation.dto.request;

import com.health360.iam.domain.RegistrationRole;
import com.health360.iam.presentation.validation.PasswordMatches;
import com.health360.iam.presentation.validation.ValidPassword;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@PasswordMatches
public class RegisterRequest {

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @ValidPassword
    private String password;

    @NotBlank
    private String confirmPassword;

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

    @NotNull
    private RegistrationRole role;

    @AssertTrue(message = "You must accept the Terms of Service and Privacy Policy")
    private boolean acceptTerms;
}
