package com.health360.automation.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DecideApprovalRequest {

    @NotBlank
    private String decision;

    private String note;
}
