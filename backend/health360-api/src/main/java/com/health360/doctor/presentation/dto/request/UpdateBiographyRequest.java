package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateBiographyRequest {

    @Size(max = 5000)
    private String biography;
}
