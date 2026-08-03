package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class HospitalProfileResponse {
    UUID id;
    String name;
    String registrationNumber;
    String hospitalType;
    Integer establishedYear;
    Integer totalBedCount;
    String accreditation;
    String description;
    EmergencyInfo emergencyInfo;
    int branchCount;
    int departmentCount;
    int doctorCount;

    @Value
    @Builder
    public static class EmergencyInfo {
        boolean emergencyAvailable24x7;
        String emergencyPhone;
        boolean ambulanceAvailable;
        boolean icuAvailable;
        Integer icuBedCount;
        String icuType;
    }
}
