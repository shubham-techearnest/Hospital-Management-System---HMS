package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotNull
    @Pattern(regexp = "ACTIVE|DEACTIVATED|LOCKED")
    private String status;
}
