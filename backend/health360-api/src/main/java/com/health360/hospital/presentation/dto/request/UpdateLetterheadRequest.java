package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateLetterheadRequest {

    @Size(max = 200)
    private String letterheadTagline;

    @Size(max = 500)
    private String letterheadFooterText;
}
