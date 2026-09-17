package com.health360.blood.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteBloodRequestRequest {

    @Size(max = 2000)
    private String notes;
}
