package com.health360.scheduling.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SlotBlockResponse {
    int slotsBlocked;
    int slotsUnblocked;
}
