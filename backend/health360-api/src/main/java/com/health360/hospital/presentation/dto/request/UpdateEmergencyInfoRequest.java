package com.health360.hospital.presentation.dto.request;

import lombok.Value;

@Value
public class UpdateEmergencyInfoRequest {
    boolean emergencyAvailable24x7;
    String emergencyPhone;
    boolean ambulanceAvailable;
    boolean icuAvailable;
    Integer icuBedCount;
    String icuType;
}
