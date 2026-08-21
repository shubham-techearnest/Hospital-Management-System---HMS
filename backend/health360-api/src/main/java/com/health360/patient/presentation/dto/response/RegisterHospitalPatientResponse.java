package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class RegisterHospitalPatientResponse {
    UUID patientId;
    String uhid;
    UUID hospitalRegistrationId;
    String receiptPath;
    String portalInviteLink;
    String portalInviteMessage;
    /** Temporary login username (email). Shown once; also logged server-side. */
    String temporaryLoginEmail;
    /** Temporary password. Shown once; also logged server-side. Patient should change after login. */
    String temporaryPassword;
}
