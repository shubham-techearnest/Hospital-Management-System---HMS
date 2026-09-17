package com.health360.blood.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class IssueBloodRequestRequest {

    /** Optional; auto-picks earliest-expiring AVAILABLE matching unit when null. */
    private UUID unitId;

    @Size(max = 2000)
    private String notes;
}
