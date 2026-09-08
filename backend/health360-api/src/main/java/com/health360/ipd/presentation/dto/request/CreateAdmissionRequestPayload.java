package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateAdmissionRequestPayload {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    private UUID sourceEncounterId;

    private UUID referringDoctorId;

    private UUID attendingDoctorId;

    private UUID departmentId;

    @NotBlank
    @Size(max = 40)
    private String admissionSource;

    @NotBlank
    @Size(max = 40)
    private String admissionType;

    @Size(max = 20)
    private String priority;

    @Size(max = 4000)
    private String reasonForAdmission;

    @Size(max = 4000)
    private String provisionalDiagnosis;

    @Size(max = 40)
    private String requestedCareLevel;

    @Size(max = 40)
    private String requestedRoomCategory;

    private Integer expectedLosDays;

    @Size(max = 2000)
    private String plannedProcedure;

    private Boolean isolationRequired;

    @Size(max = 2000)
    private String specialRequirements;

    @Size(max = 4000)
    private String notes;

    private Instant requestedAdmitAt;
}
