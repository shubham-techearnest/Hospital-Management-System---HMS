package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class OperationTheatreResponse {
    UUID theatreId;
    UUID hospitalId;
    UUID branchId;
    String name;
    String code;
    String status;
    boolean active;
}
