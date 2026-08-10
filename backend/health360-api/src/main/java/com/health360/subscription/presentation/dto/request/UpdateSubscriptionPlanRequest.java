package com.health360.subscription.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateSubscriptionPlanRequest {

    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    @DecimalMin(value = "0")
    private BigDecimal price;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "Invalid plan status")
    private String status;
}
