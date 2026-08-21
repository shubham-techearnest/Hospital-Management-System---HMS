package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.*;
import com.health360.clinical.presentation.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ClinicalMapper {

    EncounterResponse toEncounterResponse(EncounterEntity entity) {
        return EncounterResponse.builder()
                .encounterId(entity.getId())
                .encounterNumber(entity.getEncounterNumber())
                .patientId(entity.getPatientId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .departmentId(entity.getDepartmentId())
                .primaryDoctorId(entity.getPrimaryDoctorId())
                .appointmentId(entity.getAppointmentId())
                .encounterType(entity.getEncounterType())
                .status(entity.getStatus())
                .visitReason(entity.getVisitReason())
                .startedAt(entity.getStartedAt())
                .endedAt(entity.getEndedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    DiagnosisResponse toDiagnosisResponse(ClinicalDiagnosisEntity entity) {
        return DiagnosisResponse.builder()
                .diagnosisId(entity.getId())
                .encounterId(entity.getEncounterId())
                .diagnosisCode(entity.getDiagnosisCode())
                .diagnosisText(entity.getDiagnosisText())
                .diagnosisType(entity.getDiagnosisType())
                .notes(entity.getNotes())
                .recordedAt(entity.getRecordedAt())
                .build();
    }

    ClinicalNoteResponse toNoteResponse(ClinicalNoteEntity entity) {
        return ClinicalNoteResponse.builder()
                .noteId(entity.getId())
                .encounterId(entity.getEncounterId())
                .noteType(entity.getNoteType())
                .content(entity.getContent())
                .chiefComplaint(entity.getChiefComplaint())
                .hpi(entity.getHpi())
                .examination(entity.getExamination())
                .assessment(entity.getAssessment())
                .plan(entity.getPlan())
                .status(entity.getStatus())
                .recordedAt(entity.getRecordedAt())
                .finalizedAt(entity.getFinalizedAt())
                .build();
    }

    ClinicalOrderResponse toOrderResponse(ClinicalOrderEntity order, List<ClinicalOrderItemEntity> items) {
        return ClinicalOrderResponse.builder()
                .orderId(order.getId())
                .encounterId(order.getEncounterId())
                .orderNumber(order.getOrderNumber())
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .instructions(order.getInstructions())
                .orderedAt(order.getOrderedAt())
                .items(items.stream().map(this::toOrderItemResponse).toList())
                .build();
    }

    private ClinicalOrderResponse.OrderItemResponse toOrderItemResponse(ClinicalOrderItemEntity item) {
        return ClinicalOrderResponse.OrderItemResponse.builder()
                .itemId(item.getId())
                .itemCode(item.getItemCode())
                .itemName(item.getItemName())
                .itemReferenceId(item.getItemReferenceId())
                .quantity(item.getQuantity())
                .instructions(item.getInstructions())
                .status(item.getStatus())
                .build();
    }

    PrescriptionResponse toPrescriptionResponse(PrescriptionEntity entity, List<PrescriptionItemEntity> items) {
        return PrescriptionResponse.builder()
                .prescriptionId(entity.getId())
                .encounterId(entity.getEncounterId())
                .patientId(entity.getPatientId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .prescriptionNumber(entity.getPrescriptionNumber())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .prescribedBy(entity.getPrescribedBy())
                .signedAt(entity.getSignedAt())
                .createdAt(entity.getCreatedAt())
                .items(items.stream().map(this::toPrescriptionItemResponse).toList())
                .build();
    }

    private PrescriptionResponse.Item toPrescriptionItemResponse(PrescriptionItemEntity item) {
        return PrescriptionResponse.Item.builder()
                .itemId(item.getId())
                .medicineId(item.getMedicineId())
                .medicineCode(item.getMedicineCode())
                .medicineName(item.getMedicineName())
                .doseText(item.getDoseText())
                .route(item.getRoute())
                .frequency(item.getFrequency())
                .durationDays(item.getDurationDays())
                .quantity(item.getQuantity())
                .instructions(item.getInstructions())
                .safetyWarning(item.getSafetyWarning())
                .sortOrder(item.getSortOrder())
                .build();
    }
}
