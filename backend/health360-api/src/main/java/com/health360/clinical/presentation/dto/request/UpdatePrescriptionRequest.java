package com.health360.clinical.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdatePrescriptionRequest {

    @Size(max = 2000)
    private String notes;

    @NotEmpty
    @Valid
    private List<CreatePrescriptionRequest.PrescriptionItemRequest> items;
}
