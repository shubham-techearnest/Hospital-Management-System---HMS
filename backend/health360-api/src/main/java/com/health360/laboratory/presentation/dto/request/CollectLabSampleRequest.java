package com.health360.laboratory.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollectLabSampleRequest {

    @Size(max = 50)
    private String specimenId;

    @Size(max = 500)
    private String notes;
}
