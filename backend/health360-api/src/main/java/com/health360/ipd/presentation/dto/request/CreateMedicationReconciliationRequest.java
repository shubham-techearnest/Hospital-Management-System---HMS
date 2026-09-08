package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreateMedicationReconciliationRequest {

    @NotBlank
    @Size(max = 20)
    private String reconType;

    @Size(max = 4000)
    private String summaryText;

    @NotEmpty
    private List<Map<String, Object>> decisions;
}
