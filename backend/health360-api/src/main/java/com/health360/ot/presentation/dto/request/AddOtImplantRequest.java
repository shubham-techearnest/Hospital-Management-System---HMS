package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddOtImplantRequest {

    @NotBlank
    @Size(max = 200)
    private String implantName;

    @Size(max = 100)
    private String implantType;

    @Size(max = 200)
    private String manufacturer;

    @Size(max = 100)
    private String lotNumber;

    @Size(max = 100)
    private String serialNumber;

    @Min(1)
    private Integer quantity = 1;

    @Size(max = 5000)
    private String notes;
}
