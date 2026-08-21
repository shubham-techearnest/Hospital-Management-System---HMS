package com.health360.opd.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SkipQueueEntryRequest {

    private String reason;
    private UUID deskId;
}
