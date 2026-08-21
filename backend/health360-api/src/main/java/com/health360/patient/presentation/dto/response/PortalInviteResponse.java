package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class PortalInviteResponse {
    UUID patientId;
    String uhid;
    String primaryPhone;
    String inviteLink;
    String message;
}
