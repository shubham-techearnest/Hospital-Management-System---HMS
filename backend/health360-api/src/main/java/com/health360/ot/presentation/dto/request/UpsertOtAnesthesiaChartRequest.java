package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UpsertOtAnesthesiaChartRequest {

    @Size(max = 10)
    private String asaClass;

    @NotBlank
    @Size(max = 30)
    private String anesthesiaType;

    @Size(max = 200)
    private String inductionAgent;

    @Size(max = 100)
    private String airwayDevice;

    private Instant startedAt;
    private Instant endedAt;

    @Size(max = 5000)
    private String complications;

    @Size(max = 5000)
    private String notes;
}
