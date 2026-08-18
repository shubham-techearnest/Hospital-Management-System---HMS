package com.health360.ipd.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.ipd.infrastructure.persistence.entity.*;
import com.health360.ipd.presentation.dto.response.*;
import org.springframework.stereotype.Component;

@Component
public class IpdMapper {

    public IpdWardResponse toWardResponse(IpdWardEntity entity) {
        return IpdWardResponse.builder()
                .wardId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .departmentId(entity.getDepartmentId())
                .name(entity.getName())
                .code(entity.getCode())
                .wardType(entity.getWardType())
                .active(entity.isActive())
                .build();
    }

    public IpdRoomResponse toRoomResponse(IpdRoomEntity entity) {
        return IpdRoomResponse.builder()
                .roomId(entity.getId())
                .wardId(entity.getWardId())
                .name(entity.getName())
                .code(entity.getCode())
                .active(entity.isActive())
                .build();
    }

    public IpdBedResponse toBedResponse(IpdBedEntity bed, IpdRoomEntity room, IpdWardEntity ward) {
        return IpdBedResponse.builder()
                .bedId(bed.getId())
                .roomId(room.getId())
                .wardId(ward.getId())
                .wardCode(ward.getCode())
                .roomCode(room.getCode())
                .bedNumber(bed.getBedNumber())
                .status(bed.getStatus())
                .build();
    }

    public IpdAdmissionResponse toAdmissionResponse(
            IpdAdmissionEntity admission,
            EncounterEntity encounter,
            IpdBedEntity bed) {
        return IpdAdmissionResponse.builder()
                .admissionId(admission.getId())
                .encounterId(admission.getEncounterId())
                .encounterNumber(encounter.getEncounterNumber())
                .patientId(admission.getPatientId())
                .hospitalId(admission.getHospitalId())
                .branchId(admission.getBranchId())
                .primaryDoctorId(admission.getPrimaryDoctorId())
                .bedId(bed != null ? bed.getId() : null)
                .admissionNumber(admission.getAdmissionNumber())
                .admissionReason(admission.getAdmissionReason())
                .status(admission.getStatus())
                .encounterStatus(encounter.getStatus())
                .admittedAt(admission.getAdmittedAt())
                .dischargedAt(admission.getDischargedAt())
                .build();
    }

    public IpdRoundResponse toRoundResponse(IpdRoundEntity entity) {
        return IpdRoundResponse.builder()
                .roundId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .encounterId(entity.getEncounterId())
                .roundType(entity.getRoundType())
                .notes(entity.getNotes())
                .recordedAt(entity.getRecordedAt())
                .recordedBy(entity.getRecordedBy())
                .build();
    }

    public IpdDischargeResponse toDischargeResponse(
            IpdDischargeSummaryEntity summary,
            IpdAdmissionEntity admission,
            EncounterEntity encounter) {
        return IpdDischargeResponse.builder()
                .dischargeSummaryId(summary.getId())
                .admissionId(admission.getId())
                .encounterId(admission.getEncounterId())
                .summaryText(summary.getSummaryText())
                .followUpPlan(summary.getFollowUpPlan())
                .dischargedAt(summary.getDischargedAt())
                .admissionStatus(admission.getStatus())
                .encounterStatus(encounter.getStatus())
                .build();
    }
}
