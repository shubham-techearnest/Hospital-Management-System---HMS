package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteOtProcedureRequest {

    @Size(max = 5000)
    private String summaryText;
}
