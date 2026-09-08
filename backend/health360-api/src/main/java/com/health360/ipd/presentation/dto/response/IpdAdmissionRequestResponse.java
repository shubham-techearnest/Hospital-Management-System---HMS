package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class IpdAdmissionRequestResponse {
    UUID admissionRequestId;
    String requestNumber;
    UUID hospitalId;
    UUID branchId;
    UUID patientId;
    String patientName;
    String uhid;
    UUID sourceEncounterId;
    String sourceEncounterNumber;
    UUID referringDoctorId;
    UUID attendingDoctorId;
    UUID departmentId;
    String admissionSource;
    String admissionType;
    String status;
    String priority;
    String reasonForAdmission;
    String provisionalDiagnosis;
    String requestedCareLevel;
    String requestedRoomCategory;
    Integer expectedLosDays;
    String plannedProcedure;
    boolean isolationRequired;
    String specialRequirements;
    String notes;
    Instant requestedAdmitAt;
    Instant scheduledAdmitAt;
    Instant reviewedAt;
    UUID reviewedBy;
    String reviewNotes;
    String rejectionReason;
    UUID resultingAdmissionId;
    UUID reservedBedId;
    Instant createdAt;

    @Value
    @Builder
    public static class Catalogs {
        List<String> sources;
        List<String> types;
        List<String> priorities;
    }
}
