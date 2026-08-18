package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IpdRoomResponse {
    UUID roomId;
    UUID wardId;
    String name;
    String code;
    boolean active;
}
