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
                .recordedAt(entity.getRecordedAt())
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
}
