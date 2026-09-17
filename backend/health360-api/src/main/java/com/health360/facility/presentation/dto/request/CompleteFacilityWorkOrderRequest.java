package com.health360.facility.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteFacilityWorkOrderRequest {

    @Size(max = 2000)
    private String resolutionNotes;

    /** For HOUSEKEEPING with bedId: mark bed AVAILABLE (default true). */
    private Boolean markBedAvailable;
}
