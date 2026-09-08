package com.health360.pharmacy.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdministerMedicationRequest {

    /** GIVEN (default), OMITTED, or REFUSED. Never auto-administered. */
    @Size(max = 20)
    private String outcome = "GIVEN";

    @Size(max = 100)
    private String doseGiven;

    @Size(max = 30)
    private String route;

    @Size(max = 40)
    private String reasonCode;

    @Size(max = 2000)
    private String reasonText;

    @Size(max = 2000)
    private String notes;
}
