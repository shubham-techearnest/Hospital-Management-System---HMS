package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IpdBedResponse {
    UUID bedId;
    UUID roomId;
    UUID wardId;
    String wardCode;
    String roomCode;
    String bedNumber;
    String status;
}
