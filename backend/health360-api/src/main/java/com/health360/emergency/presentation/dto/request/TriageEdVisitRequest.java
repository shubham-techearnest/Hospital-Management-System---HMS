package com.health360.emergency.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TriageEdVisitRequest {

    @NotNull
    @Min(1)
    @Max(5)
    private Integer triageAcuity;

    @Size(max = 4000)
    private String triageNotes;
}
