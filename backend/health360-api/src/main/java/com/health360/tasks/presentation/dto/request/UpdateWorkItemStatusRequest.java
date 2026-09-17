package com.health360.tasks.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkItemStatusRequest {

    @NotBlank
    private String status;
}
