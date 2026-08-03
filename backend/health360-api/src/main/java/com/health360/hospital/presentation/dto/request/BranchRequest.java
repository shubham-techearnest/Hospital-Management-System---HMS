package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;

@Value
public class BranchRequest {
    @NotBlank @Size(max = 200) String name;
    @NotBlank @Size(max = 200) String addressLine1;
    @Size(max = 200) String addressLine2;
    @NotBlank @Size(max = 100) String city;
    @NotBlank @Size(max = 100) String state;
    @NotBlank @Size(max = 10) String pincode;
    String country;
    @NotNull BigDecimal latitude;
    @NotNull BigDecimal longitude;
    @NotBlank @Size(max = 20) String phone;
    @Size(max = 255) String email;
    boolean primary;
    List<WorkingHoursItem> workingHours;

    @Value
    public static class WorkingHoursItem {
        @NotBlank String dayOfWeek;
        @NotBlank String openTime;
        @NotBlank String closeTime;
        boolean closed;
    }
}
