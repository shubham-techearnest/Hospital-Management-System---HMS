package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class OtTeamMemberResponse {
    UUID teamMemberId;
    UUID procedureId;
    String memberRole;
    UUID userId;
    String memberName;
}
