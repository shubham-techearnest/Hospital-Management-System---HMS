package com.health360.clinical.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDiagnosisRequest {

    @Size(max = 50)
    private String diagnosisCode;

    @NotBlank
    @Size(max = 500)
    private String diagnosisText;

    @Size(max = 20)
    private String diagnosisType;

    @Size(max = 2000)
    private String notes;
}
