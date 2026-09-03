package com.health360.review.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class SubmitReviewRequest {

    /** Completed appointment to review (legacy booked visits). */
    private UUID appointmentId;

    /** Completed encounter to review (walk-in / OPD request visits). */
    private UUID encounterId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 1000)
    private String comment;
}
