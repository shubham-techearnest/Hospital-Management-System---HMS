package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class BranchResponse {
    UUID id;
    String name;
    String addressLine1;
    String addressLine2;
    String city;
    String state;
    String pincode;
    String country;
    BigDecimal latitude;
    BigDecimal longitude;
    String phone;
    String email;
    boolean primary;
    List<WorkingHoursResponse> workingHours;

    @Value
    @Builder
    public static class WorkingHoursResponse {
        String dayOfWeek;
        String openTime;
        String closeTime;
        boolean closed;
    }
}
