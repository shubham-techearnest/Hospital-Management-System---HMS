package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class DeskAppointmentLookupResponse {
    UUID appointmentId;
    String appointmentStatus;
    Instant scheduledAt;
    UUID patientId;
    String patientName;
    String uhid;
    String primaryPhone;
    UUID doctorId;
    String doctorName;
    String hospitalName;
    String branchName;
    boolean canArrive;
}
