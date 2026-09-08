package com.health360.laboratory.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReleaseLabReportRequest {

    @Size(max = 5000)
    private String summaryText;

    /** Clinician/lab marks result as critical at release. */
    private Boolean critical;
}
