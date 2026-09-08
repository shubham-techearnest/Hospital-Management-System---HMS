package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDischargeOrderRequest {
    @Size(max = 4000)
    private String notes;
}
