package com.health360.ipd.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.ipd.infrastructure.persistence.entity.*;
import com.health360.ipd.presentation.dto.response.*;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
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
                .cleaningStartedAt(bed.getCleaningStartedAt())
                .cleanedAt(bed.getCleanedAt())
                .cleanedBy(bed.getCleanedBy())
                .build();
    }

    public IpdAdmissionResponse toAdmissionResponse(
            IpdAdmissionEntity admission,
            EncounterEntity encounter,
            IpdBedEntity bed,
            IpdRoomEntity room,
            IpdWardEntity ward,
            PatientProfileEntity patient) {
        String patientName = null;
        String uhid = null;
        if (patient != null) {
            String first = patient.getLegalFirstName() != null ? patient.getLegalFirstName().trim() : "";
            String last = patient.getLegalLastName() != null ? patient.getLegalLastName().trim() : "";
            patientName = (first + " " + last).trim();
            if (patientName.isEmpty()) {
                patientName = null;
            }
            uhid = patient.getUhid();
        }

        return IpdAdmissionResponse.builder()
                .admissionId(admission.getId())
                .encounterId(admission.getEncounterId())
                .encounterNumber(encounter.getEncounterNumber())
                .patientId(admission.getPatientId())
                .patientName(patientName)
                .uhid(uhid)
                .hospitalId(admission.getHospitalId())
                .branchId(admission.getBranchId())
                .primaryDoctorId(admission.getPrimaryDoctorId())
                .bedId(bed != null ? bed.getId() : null)
                .wardCode(ward != null ? ward.getCode() : null)
                .roomCode(room != null ? room.getCode() : null)
                .bedNumber(bed != null ? bed.getBedNumber() : null)
                .admissionNumber(admission.getAdmissionNumber())
                .admissionReason(admission.getAdmissionReason())
                .status(admission.getStatus())
                .encounterStatus(encounter.getStatus())
                .admittedAt(admission.getAdmittedAt())
                .dischargedAt(admission.getDischargedAt())
                .isolationRequired(admission.isIsolationRequired())
                .careLevel(admission.getCareLevel())
                .activeIcuStayId(admission.getActiveIcuStayId())
                .admissionSource(admission.getAdmissionSource())
                .admissionType(admission.getAdmissionType())
                .followUpAppointmentId(admission.getFollowUpAppointmentId())
                .closedAt(admission.getClosedAt())
                .closedBy(admission.getClosedBy())
                .readmittedFromAdmissionId(admission.getReadmittedFromAdmissionId())
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
                .dischargeType(summary.getDischargeType())
                .versionNo(summary.getVersionNo())
                .diagnosisText(summary.getDiagnosisText())
                .medicationsText(summary.getMedicationsText())
                .adviceText(summary.getAdviceText())
                .build();
    }
}
