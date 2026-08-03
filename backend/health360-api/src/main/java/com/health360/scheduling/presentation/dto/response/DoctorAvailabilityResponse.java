package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class DoctorAvailabilityResponse {
    UUID doctorId;
    UUID hospitalId;
    UUID branchId;
    List<DayAvailability> days;

    @Value
    @Builder
    public static class DayAvailability {
        LocalDate date;
        List<SlotAvailability> slots;
    }

    @Value
    @Builder
    public static class SlotAvailability {
        UUID id;
        LocalTime startTime;
        LocalTime endTime;
        String consultationType;
        String status;
    }
}
