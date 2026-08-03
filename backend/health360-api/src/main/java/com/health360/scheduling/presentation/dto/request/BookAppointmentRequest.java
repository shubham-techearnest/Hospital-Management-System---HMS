package com.health360.scheduling.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class BookAppointmentRequest {

    @NotNull
    private UUID doctorId;

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID slotId;

    @NotNull
    private String consultationType;

    @Size(max = 500)
    private String reasonForVisit;
}
