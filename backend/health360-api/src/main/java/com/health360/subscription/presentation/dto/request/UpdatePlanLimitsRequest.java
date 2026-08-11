package com.health360.subscription.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePlanLimitsRequest {

    @NotEmpty
    @Valid
    private List<PlanLimitItem> limits;

    @Data
    public static class PlanLimitItem {

        @NotBlank
        @Size(max = 100)
        private String limitKey;

        @Min(0)
        private long limitValue;
    }
}
