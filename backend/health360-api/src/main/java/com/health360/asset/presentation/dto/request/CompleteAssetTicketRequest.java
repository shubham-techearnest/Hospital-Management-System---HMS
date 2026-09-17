package com.health360.asset.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteAssetTicketRequest {

    @Size(max = 2000)
    private String resolutionNotes;

    /** When true, restore asset to AVAILABLE after completion. Default true. */
    private Boolean restoreAvailable;
}
