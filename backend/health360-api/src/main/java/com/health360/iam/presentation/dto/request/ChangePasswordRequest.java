package com.health360.iam.presentation.dto.request;

import com.health360.iam.presentation.validation.PasswordMatches;
import com.health360.iam.presentation.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@PasswordMatches
public class ChangePasswordRequest {

    @NotBlank
    private String currentPassword;

    @NotBlank
    @ValidPassword
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
