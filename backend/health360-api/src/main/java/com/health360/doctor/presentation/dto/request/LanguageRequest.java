package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class LanguageRequest {
    @NotBlank
    @Pattern(regexp = "[a-z]{2}", message = "Language code must be ISO 639-1 (2 lowercase letters)")
    String languageCode;
}
