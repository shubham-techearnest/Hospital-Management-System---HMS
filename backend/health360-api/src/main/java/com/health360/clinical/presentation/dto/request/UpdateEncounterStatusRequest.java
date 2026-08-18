package com.health360.clinical.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateEncounterStatusRequest {

    @NotBlank
    @Size(max = 20)
    private String status;
}
