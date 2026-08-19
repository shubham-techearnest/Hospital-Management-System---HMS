package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddOtNoteRequest {

    @NotBlank
    @Size(max = 20)
    private String noteType;

    @NotBlank
    @Size(max = 10000)
    private String content;
}
