package com.health360.laboratory.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AcknowledgeCriticalLabRequest {

    @Size(max = 2000)
    private String note;
}
