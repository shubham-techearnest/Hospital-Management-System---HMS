package com.health360.radiology.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ScheduleImagingStudyRequest {

    private Instant scheduledAt;

    @Size(max = 2000)
    private String notes;
}
