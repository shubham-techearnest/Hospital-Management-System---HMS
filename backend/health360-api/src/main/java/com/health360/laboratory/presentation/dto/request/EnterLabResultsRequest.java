package com.health360.laboratory.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class EnterLabResultsRequest {

    @NotEmpty
    @Valid
    private List<ResultEntry> results;

    @Getter
    @Setter
    public static class ResultEntry {

        @NotNull
        private UUID parameterId;

        @NotBlank
        @Size(max = 200)
        private String valueText;

        private BigDecimal valueNumeric;
    }
}
