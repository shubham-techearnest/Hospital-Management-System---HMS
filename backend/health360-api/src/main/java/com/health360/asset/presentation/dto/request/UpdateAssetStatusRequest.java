package com.health360.asset.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAssetStatusRequest {

    @NotBlank
    private String status;
}
