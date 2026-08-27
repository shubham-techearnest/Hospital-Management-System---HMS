package com.health360.laboratory.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.domain.ClinicalOrderStatus;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.laboratory.infrastructure.persistence.entity.LabOrderEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabSampleEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabTestEntity;
import com.health360.laboratory.infrastructure.persistence.repository.LabOrderRepository;
import com.health360.laboratory.infrastructure.persistence.repository.LabSampleRepository;
import com.health360.laboratory.presentation.dto.response.LabReportResponse;
import com.health360.laboratory.presentation.dto.response.PatientLabOrderResponse;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LabPatientJourneyService {

    private final LabOrderRepository labOrderRepository;
    private final LabSampleRepository sampleRepository;
    private final ClinicalOrderRepository clinicalOrderRepository;
    private final ClinicalOrderItemRepository clinicalOrderItemRepository;
    private final EncounterRepository encounterRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final LabCatalogService catalogService;
    private final LabFulfillmentService fulfillmentService;
    private final EncounterAccessService encounterAccessService;

    @Transactional(readOnly = true)
    public List<PatientLabOrderResponse> listMyLabOrders(UserPrincipal principal) {
        PatientProfileEntity profile = requirePatientProfile(principal);
        UUID tenantId = principal.getTenantId();

        List<ClinicalOrderItemEntity> items =
                labOrderRepository.findLabItemsForPatient(tenantId, profile.getId());
        List<PatientLabOrderResponse> responses = new ArrayList<>();
        Map<UUID, HospitalEntity> hospitals = new HashMap<>();

        for (ClinicalOrderItemEntity item : items) {
            ClinicalOrderEntity clinicalOrder = clinicalOrderRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                    .orElse(null);
            if (clinicalOrder == null) {
                continue;
            }
            EncounterEntity encounter = encounterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrder.getEncounterId(), tenantId)
                    .orElse(null);
            if (encounter == null) {
                continue;
            }

            HospitalEntity hospital = hospitals.computeIfAbsent(encounter.getHospitalId(), id ->
                    hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId).orElse(null));

            LabOrderEntity labOrder = labOrderRepository
                    .findByClinicalOrderItemIdAndDeletedAtIsNull(item.getId())
                    .orElse(null);

            String testName = item.getItemName();
            String testCode = item.getItemCode();
            UUID labTestId = item.getItemReferenceId();
            LabReportResponse report = null;
            String specimenId = null;
            if (labOrder != null) {
                LabTestEntity test = catalogService.requireTest(tenantId, labOrder.getLabTestId());
                testName = test.getName();
                testCode = test.getCode();
                labTestId = test.getId();
                LabSampleEntity sample = sampleRepository.findByLabOrderIdAndDeletedAtIsNull(labOrder.getId())
                        .orElse(null);
                specimenId = sample != null ? sample.getSpecimenId() : null;
                if (labOrder.getStatus().equals("RELEASED")) {
                    report = fulfillmentService.getReleasedReportForOrder(tenantId, labOrder);
                }
            }

            boolean canBook = labOrder == null
                    && ClinicalOrderStatus.ORDERED.name().equals(item.getStatus())
                    && item.getItemReferenceId() != null;

            responses.add(PatientLabOrderResponse.builder()
                    .clinicalOrderItemId(item.getId())
                    .clinicalOrderId(clinicalOrder.getId())
                    .encounterId(encounter.getId())
                    .encounterNumber(encounter.getEncounterNumber())
                    .hospitalId(encounter.getHospitalId())
                    .hospitalName(hospital != null ? hospital.getName() : null)
                    .branchId(encounter.getBranchId())
                    .labTestId(labTestId)
                    .testName(testName)
                    .testCode(testCode)
                    .itemStatus(item.getStatus())
                    .labOrderId(labOrder != null ? labOrder.getId() : null)
                    .labOrderStatus(labOrder != null ? labOrder.getStatus() : null)
                    .orderedAt(clinicalOrder.getOrderedAt())
                    .canBookHospital(canBook)
                    .specimenId(specimenId)
                    .report(report)
                    .build());
        }

        return responses;
    }

    @Transactional
    public PatientLabOrderResponse bookHospitalLab(UserPrincipal principal, UUID clinicalOrderItemId) {
        PatientProfileEntity profile = requirePatientProfile(principal);
        UUID tenantId = principal.getTenantId();

        ClinicalOrderItemEntity item = clinicalOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrderItemId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical order item not found"));

        ClinicalOrderEntity clinicalOrder = clinicalOrderRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(item.getOrderId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical order not found"));

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrder.getEncounterId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));

        if (!encounter.getPatientId().equals(profile.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        encounterAccessService.assertCanReadEncounter(principal, encounter);

        fulfillmentService.createLabOrderForPatient(principal, clinicalOrderItemId);

        return listMyLabOrders(principal).stream()
                .filter(r -> r.getClinicalOrderItemId().equals(clinicalOrderItemId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Booked lab order not found"));
    }

    private PatientProfileEntity requirePatientProfile(UserPrincipal principal) {
        return patientProfileRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNull(principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));
    }
}
