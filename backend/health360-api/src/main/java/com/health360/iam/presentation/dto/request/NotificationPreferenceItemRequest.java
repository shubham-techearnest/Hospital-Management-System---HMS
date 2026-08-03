package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NotificationPreferenceItemRequest {

    @NotBlank
    @Size(max = 50)
    private String notificationType;

    @NotNull
    private Boolean emailEnabled;

    @NotNull
    private Boolean smsEnabled;

    @NotNull
    private Boolean inAppEnabled;
}
