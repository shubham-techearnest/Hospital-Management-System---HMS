package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserProfileRequest {

    @Size(min = 1, max = 100)
    @Pattern(regexp = "^[\\p{L} .'-]+$", message = "First name contains invalid characters")
    private String firstName;

    @Size(min = 1, max = 100)
    private String lastName;

    @Pattern(regexp = "^(\\+?[1-9]\\d{9,14}|[6-9]\\d{9})$", message = "Invalid phone number")
    private String phone;

    @Size(max = 500)
    private String avatarUrl;

    @Size(max = 50)
    private String timezone;

    @Size(max = 10)
    private String locale;
}
