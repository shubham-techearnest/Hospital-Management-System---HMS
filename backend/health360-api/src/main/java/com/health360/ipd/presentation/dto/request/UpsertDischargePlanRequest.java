package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class UpsertDischargePlanRequest {
    private Instant expectedDischargeAt;

    @Size(max = 30)
    private String readiness;

    @Size(max = 8000)
    private String pendingResultsJson;

    @Size(max = 4000)
    private String barriers;

    @Size(max = 4000)
    private String notes;
}
