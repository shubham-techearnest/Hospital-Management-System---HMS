package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class OtProcedureResponse {
    UUID procedureId;
    UUID clinicalOrderItemId;
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    UUID theatreId;
    String theatreCode;
    String theatreName;
    String procedureName;
    String status;
    Instant receivedAt;
    Instant startedAt;
    Instant completedAt;
    OtScheduleResponse schedule;
    List<OtTeamMemberResponse> teamMembers;
    List<OtNoteResponse> notes;
}
