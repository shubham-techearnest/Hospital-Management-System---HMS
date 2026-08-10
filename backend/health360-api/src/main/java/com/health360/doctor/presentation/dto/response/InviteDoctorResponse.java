package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class InviteDoctorResponse {
    UUID userId;
    UUID doctorId;
    UUID associationId;
    String email;
    String status;
    boolean invitationEmailSent;
    String message;
}
