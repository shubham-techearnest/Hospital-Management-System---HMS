package com.health360.emergency.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateEdVisitRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID patientId;

    @NotBlank
    @Size(max = 40)
    private String arrivalMode;

    @Size(max = 4000)
    private String chiefComplaint;
}
