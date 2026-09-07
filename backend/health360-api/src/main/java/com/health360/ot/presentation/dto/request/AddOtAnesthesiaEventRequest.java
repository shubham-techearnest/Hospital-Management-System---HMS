package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddOtAnesthesiaEventRequest {

    @NotBlank
    @Size(max = 40)
    private String eventType;

    private Integer systolicBp;
    private Integer diastolicBp;
    private Integer pulse;
    private Integer spo2;

    @Size(max = 2000)
    private String notes;
}
