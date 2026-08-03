package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NotificationPreferenceResponse {
    String notificationType;
    boolean emailEnabled;
    boolean smsEnabled;
    boolean inAppEnabled;
}
