package com.health360.clinical.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClinicalNoteRequest {

    @Size(max = 30)
    private String noteType;

    @NotBlank
    @Size(max = 10000)
    private String content;
}
