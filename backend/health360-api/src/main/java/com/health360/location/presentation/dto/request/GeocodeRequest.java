package com.health360.location.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GeocodeRequest {
    @NotBlank
    @Size(max = 500)
    private String address;
}
