package com.health360.doctor.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateConsultationDefaultsRequest {

    @NotEmpty
    @Valid
    private List<ConsultationDefaultItem> configs;

    @Data
    public static class ConsultationDefaultItem {

        @NotBlank
        @Size(max = 20)
        private String consultationType;

        @NotNull
        @DecimalMin("0")
        private BigDecimal feeAmount;

        @Size(min = 3, max = 3)
        private String currency = "INR";

        @NotNull
        private Integer durationMinutes = 15;
    }
}
