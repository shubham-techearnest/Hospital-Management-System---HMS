package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class HospitalDoctorResponse {
    UUID associationId;
    UUID doctorId;
    String doctorName;
    String medicalRegistrationNumber;
    String specialization;
    UUID branchId;
    String branchName;
    UUID departmentId;
    String departmentName;
    String status;
}
