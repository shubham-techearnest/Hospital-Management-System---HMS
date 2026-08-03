package com.health360.review.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ModerateReviewRequest {

    @NotNull
    @Pattern(regexp = "HIDE|REMOVE")
    private String action;

    @NotBlank
    private String reason;
}
