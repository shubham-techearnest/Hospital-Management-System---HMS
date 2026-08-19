package com.health360.radiology.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PerformImagingStudyRequest {

    @Size(max = 2000)
    private String notes;
}
