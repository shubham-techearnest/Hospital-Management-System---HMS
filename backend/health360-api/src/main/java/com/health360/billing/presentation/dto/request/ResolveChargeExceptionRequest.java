package com.health360.billing.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResolveChargeExceptionRequest {

    /** RESOLVED or IGNORED */
    @NotBlank
    private String decision;

    private String note;
}
