package com.health360.asset.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportAssetBreakdownRequest {

    @NotBlank
    @Size(max = 2000)
    private String description;

    @Size(max = 20)
    private String priority;
}
