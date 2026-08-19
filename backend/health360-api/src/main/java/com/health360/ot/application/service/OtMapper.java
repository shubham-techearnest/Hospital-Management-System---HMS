package com.health360.ot.application.service;

import com.health360.ot.infrastructure.persistence.entity.*;
import com.health360.ot.presentation.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OtMapper {

    public OperationTheatreResponse toTheatreResponse(OperationTheatreEntity entity) {
        return OperationTheatreResponse.builder()
                .theatreId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .name(entity.getName())
                .code(entity.getCode())
                .status(entity.getStatus())
                .active(entity.isActive())
                .build();
    }

    public OtScheduleResponse toScheduleResponse(OtScheduleEntity entity) {
        return OtScheduleResponse.builder()
                .scheduleId(entity.getId())
                .theatreId(entity.getTheatreId())
                .scheduledStart(entity.getScheduledStart())
                .scheduledEnd(entity.getScheduledEnd())
                .status(entity.getStatus())
                .build();
    }

    public OtTeamMemberResponse toTeamMemberResponse(OtTeamMemberEntity entity) {
        return OtTeamMemberResponse.builder()
                .teamMemberId(entity.getId())
                .procedureId(entity.getProcedureId())
                .memberRole(entity.getMemberRole())
                .userId(entity.getUserId())
                .memberName(entity.getMemberName())
                .build();
    }

    public OtNoteResponse toNoteResponse(OtNoteEntity entity) {
        return OtNoteResponse.builder()
                .noteId(entity.getId())
                .procedureId(entity.getProcedureId())
                .noteType(entity.getNoteType())
                .content(entity.getContent())
                .recordedAt(entity.getRecordedAt())
                .recordedBy(entity.getRecordedBy())
                .build();
    }

    public OtProcedureResponse toProcedureResponse(
            OtProcedureEntity procedure,
            OperationTheatreEntity theatre,
            OtScheduleEntity schedule,
            List<OtTeamMemberEntity> teamMembers,
            List<OtNoteEntity> notes) {
        return OtProcedureResponse.builder()
                .procedureId(procedure.getId())
                .clinicalOrderItemId(procedure.getClinicalOrderItemId())
                .clinicalOrderId(procedure.getClinicalOrderId())
                .encounterId(procedure.getEncounterId())
                .patientId(procedure.getPatientId())
                .hospitalId(procedure.getHospitalId())
                .branchId(procedure.getBranchId())
                .theatreId(procedure.getTheatreId())
                .theatreCode(theatre != null ? theatre.getCode() : null)
                .theatreName(theatre != null ? theatre.getName() : null)
                .procedureName(procedure.getProcedureName())
                .status(procedure.getStatus())
                .receivedAt(procedure.getReceivedAt())
                .startedAt(procedure.getStartedAt())
                .completedAt(procedure.getCompletedAt())
                .schedule(schedule != null ? toScheduleResponse(schedule) : null)
                .teamMembers(teamMembers.stream().map(this::toTeamMemberResponse).toList())
                .notes(notes.stream().map(this::toNoteResponse).toList())
                .build();
    }
}
