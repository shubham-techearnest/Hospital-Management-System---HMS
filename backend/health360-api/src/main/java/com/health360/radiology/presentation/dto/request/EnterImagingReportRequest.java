package com.health360.radiology.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnterImagingReportRequest {

    @Size(max = 10000)
    private String findingsText;

    @Size(max = 5000)
    private String impressionText;
}
