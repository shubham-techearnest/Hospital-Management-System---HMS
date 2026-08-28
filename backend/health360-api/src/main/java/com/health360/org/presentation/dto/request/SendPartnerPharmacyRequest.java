package com.health360.org.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SendPartnerPharmacyRequest {
    @NotNull
    private UUID partnerOrgId;
    @NotNull
    private UUID locationId;
}
