package com.health360.billing.presentation.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class AttachChargesRequest {

    /** Existing invoice; if null, an INTERIM invoice is created from the first charge's encounter. */
    private UUID invoiceId;

    @NotEmpty
    private List<UUID> chargePostingIds;
}
