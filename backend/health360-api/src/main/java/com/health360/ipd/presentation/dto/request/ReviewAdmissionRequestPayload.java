package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class ReviewAdmissionRequestPayload {

    @Size(max = 4000)
    private String reviewNotes;

    @Size(max = 2000)
    private String rejectionReason;

    private Instant scheduledAdmitAt;
}
