package com.health360.pharmacy.application.service;

import com.health360.pharmacy.infrastructure.persistence.entity.*;
import com.health360.pharmacy.presentation.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class PharmacyMapper {

    public MedicineResponse toMedicineResponse(MedicineEntity entity) {
        return MedicineResponse.builder()
                .medicineId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .code(entity.getCode())
                .name(entity.getName())
                .form(entity.getForm())
                .strength(entity.getStrength())
                .defaultRoute(entity.getDefaultRoute())
                .active(entity.isActive())
                .build();
    }

    public MedicationAdministrationResponse toAdministrationResponse(
            MedicationAdministrationEntity entity, String medicineName) {
        return MedicationAdministrationResponse.builder()
                .administrationId(entity.getId())
                .medicationOrderItemId(entity.getMedicationOrderItemId())
                .medicationOrderId(entity.getMedicationOrderId())
                .encounterId(entity.getEncounterId())
                .patientId(entity.getPatientId())
                .medicineName(medicineName)
                .doseGiven(entity.getDoseGiven())
                .route(entity.getRoute())
                .administeredAt(entity.getAdministeredAt())
                .administeredBy(entity.getAdministeredBy())
                .notes(entity.getNotes())
                .build();
    }

    public MedicationOrderItemResponse toOrderItemResponse(
            MedicationOrderItemEntity item, List<MedicationAdministrationResponse> administrations) {
        return MedicationOrderItemResponse.builder()
                .orderItemId(item.getId())
                .clinicalOrderItemId(item.getClinicalOrderItemId())
                .medicineId(item.getMedicineId())
                .medicineName(item.getMedicineName())
                .status(item.getStatus())
                .doseText(item.getDoseText())
                .route(item.getRoute())
                .frequency(item.getFrequency())
                .durationDays(item.getDurationDays())
                .instructions(item.getInstructions())
                .plannedAt(item.getPlannedAt())
                .completedAt(item.getCompletedAt())
                .administrations(administrations != null ? administrations : Collections.emptyList())
                .build();
    }

    public MedicationOrderResponse toOrderResponse(
            MedicationOrderEntity order, List<MedicationOrderItemResponse> items) {
        return MedicationOrderResponse.builder()
                .medicationOrderId(order.getId())
                .clinicalOrderId(order.getClinicalOrderId())
                .encounterId(order.getEncounterId())
                .patientId(order.getPatientId())
                .hospitalId(order.getHospitalId())
                .branchId(order.getBranchId())
                .status(order.getStatus())
                .receivedAt(order.getReceivedAt())
                .verifiedAt(order.getVerifiedAt())
                .verifiedBy(order.getVerifiedBy())
                .completedAt(order.getCompletedAt())
                .items(items)
                .build();
    }
}
