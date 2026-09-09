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
    /**
     * Preferred login identifier to show staff/patient.
     * Mobile when no real email was provided; otherwise the real email.
     * Never a system stub (@patient.health360.local).
     */
    String temporaryLoginEmail;
    /** Mobile number the patient can always use to sign in. */
    String loginMobile;
    /** Real email if provided at registration; null when only mobile login applies. */
    String loginEmail;
    /** Temporary password. Shown once; also logged server-side. Patient should change after login. */
    String temporaryPassword;
    /** Short instruction for staff to read aloud to the patient. */
    String loginInstructions;
}
