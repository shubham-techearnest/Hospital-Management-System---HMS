package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConsentRequest {
    @NotNull
    private Boolean accepted;
}
