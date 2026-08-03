package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembershipRequest {

    @NotBlank
    @Size(max = 200)
    private String organization;

    @Size(max = 100)
    private String membershipId;

    @Min(1900)
    @Max(2100)
    private Integer memberSince;
}
