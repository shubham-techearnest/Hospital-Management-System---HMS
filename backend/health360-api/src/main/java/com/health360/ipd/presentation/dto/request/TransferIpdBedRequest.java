package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class TransferIpdBedRequest {

    @NotNull
    private UUID bedId;

    private String reason;
}
