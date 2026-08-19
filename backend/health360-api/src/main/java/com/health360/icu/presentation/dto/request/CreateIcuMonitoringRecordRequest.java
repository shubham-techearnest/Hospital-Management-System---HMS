package com.health360.icu.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class CreateIcuMonitoringRecordRequest {

    @NotBlank
    private String recordType;

    private Map<String, Object> payload;

    @Size(max = 2000)
    private String notes;
}
