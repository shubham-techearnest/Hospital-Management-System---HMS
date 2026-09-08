package com.health360.ipd.presentation.dto.request;

import lombok.Data;

@Data
public class UpdateIpdIsolationRequest {
    private Boolean isolationRequired;
    private String careLevel;
}
