package com.health360.iam.presentation.dto.request;

import com.health360.iam.domain.OnboardingRequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateOnboardingRequestStatusRequest {

    @NotNull
    private OnboardingRequestStatus status;

    @Size(max = 2000)
    private String adminNotes;
}
