package com.health360.staffops.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateRosterEntryRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID staffId;

    @NotNull
    private UUID shiftId;

    @NotNull
    private LocalDate dutyDate;

    @Size(max = 30)
    private String status;

    @Size(max = 2000)
    private String notes;
}
