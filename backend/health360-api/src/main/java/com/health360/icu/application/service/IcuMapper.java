package com.health360.icu.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.icu.infrastructure.persistence.entity.*;
import com.health360.icu.presentation.dto.response.*;
import org.springframework.stereotype.Component;

@Component
public class IcuMapper {

    public IcuUnitResponse toUnitResponse(IcuUnitEntity entity) {
        return IcuUnitResponse.builder()
                .unitId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .name(entity.getName())
                .code(entity.getCode())
                .active(entity.isActive())
                .build();
    }

    public IcuBedResponse toBedResponse(IcuBedEntity bed, IcuUnitEntity unit) {
        return IcuBedResponse.builder()
                .bedId(bed.getId())
                .unitId(unit.getId())
                .unitCode(unit.getCode())
                .bedNumber(bed.getBedNumber())
                .status(bed.getStatus())
                .build();
    }

    public IcuStayResponse toStayResponse(
            IcuStayEntity stay, EncounterEntity encounter, IcuBedEntity bed) {
        return IcuStayResponse.builder()
                .stayId(stay.getId())
                .encounterId(stay.getEncounterId())
                .patientId(stay.getPatientId())
                .hospitalId(stay.getHospitalId())
                .branchId(stay.getBranchId())
                .primaryDoctorId(stay.getPrimaryDoctorId())
                .ipdAdmissionId(stay.getIpdAdmissionId())
                .bedId(bed != null ? bed.getId() : null)
                .stayNumber(stay.getStayNumber())
                .admissionReason(stay.getAdmissionReason())
                .status(stay.getStatus())
                .encounterStatus(encounter.getStatus())
                .admittedAt(stay.getAdmittedAt())
                .dischargedAt(stay.getDischargedAt())
                .build();
    }

    public IcuEquipmentResponse toEquipmentResponse(IcuEquipmentEntity entity) {
        return IcuEquipmentResponse.builder()
                .equipmentId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .unitId(entity.getUnitId())
                .name(entity.getName())
                .code(entity.getCode())
                .equipmentType(entity.getEquipmentType())
                .status(entity.getStatus())
                .build();
    }

    public IcuEquipmentAssignmentResponse toEquipmentAssignmentResponse(
            IcuEquipmentAssignmentEntity assignment, IcuEquipmentEntity equipment) {
        return IcuEquipmentAssignmentResponse.builder()
                .assignmentId(assignment.getId())
                .equipmentId(equipment.getId())
                .stayId(assignment.getStayId())
                .equipmentCode(equipment.getCode())
                .equipmentName(equipment.getName())
                .assignedAt(assignment.getAssignedAt())
                .releasedAt(assignment.getReleasedAt())
                .active(assignment.isActive())
                .notes(assignment.getNotes())
                .build();
    }

    public IcuMonitoringRecordResponse toMonitoringRecordResponse(IcuMonitoringRecordEntity entity) {
        return IcuMonitoringRecordResponse.builder()
                .recordId(entity.getId())
                .stayId(entity.getStayId())
                .encounterId(entity.getEncounterId())
                .recordType(entity.getRecordType())
                .payload(entity.getPayload())
                .notes(entity.getNotes())
                .recordedAt(entity.getRecordedAt())
                .recordedBy(entity.getRecordedBy())
                .build();
    }

    public IcuDischargeResponse toDischargeResponse(
            IcuStayEntity stay, EncounterEntity encounter, String summaryText, String followUpPlan) {
        return IcuDischargeResponse.builder()
                .stayId(stay.getId())
                .encounterId(stay.getEncounterId())
                .summaryText(summaryText)
                .followUpPlan(followUpPlan)
                .stayStatus(stay.getStatus())
                .encounterStatus(encounter.getStatus())
                .dischargedAt(stay.getDischargedAt())
                .build();
    }
}
