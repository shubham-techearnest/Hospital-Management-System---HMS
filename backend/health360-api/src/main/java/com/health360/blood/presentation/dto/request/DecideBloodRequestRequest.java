package com.health360.blood.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DecideBloodRequestRequest {

    /** APPROVED | REJECTED */
    @NotBlank
    @Size(max = 30)
    private String decision;

    @Size(max = 2000)
    private String decisionNotes;
}
