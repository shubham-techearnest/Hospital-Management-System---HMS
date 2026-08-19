package com.health360.pharmacy.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.domain.ClinicalOrderStatus;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalOrderRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.pharmacy.domain.MedicationOrderItemStatus;
import com.health360.pharmacy.domain.MedicationOrderStatus;
import com.health360.pharmacy.infrastructure.persistence.entity.*;
import com.health360.pharmacy.infrastructure.persistence.repository.*;
import com.health360.pharmacy.presentation.dto.request.AdministerMedicationRequest;
import com.health360.pharmacy.presentation.dto.request.CreateMedicationOrderRequest;
import com.health360.pharmacy.presentation.dto.request.PlanMedicationOrderItemRequest;
import com.health360.pharmacy.presentation.dto.response.*;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PharmacyFulfillmentService {

    private final MedicationOrderRepository medicationOrderRepository;
    private final MedicationOrderItemRepository medicationOrderItemRepository;
    private final MedicationAdministrationRepository administrationRepository;
    private final ClinicalOrderRepository clinicalOrderRepository;
    private final ClinicalOrderItemRepository clinicalOrderItemRepository;
    private final EncounterRepository encounterRepository;
    private final PharmacyCatalogService catalogService;
    private final PharmacyAccessService accessService;
    private final EncounterAccessService encounterAccessService;
    private final PharmacyMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<MedicationWorklistItemResponse> listPendingWorklist(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadMedicationOrders(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        return medicationOrderRepository.findPendingMedicationOrders(tenantId, hospitalId, branchId).stream()
                .map(order -> {
                    EncounterEntity encounter = encounterRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(order.getEncounterId(), tenantId)
                            .orElseThrow();
                    int itemCount = clinicalOrderItemRepository
                            .findByOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(order.getId()).size();
                    return MedicationWorklistItemResponse.builder()
                            .clinicalOrderId(order.getId())
                            .encounterId(encounter.getId())
                            .patientId(encounter.getPatientId())
                            .orderNumber(order.getOrderNumber())
                            .orderedAt(order.getOrderedAt())
                            .itemCount(itemCount)
                            .build();
                })
                .toList();
    }

    @Transactional
    public MedicationOrderResponse createMedicationOrder(
            UserPrincipal principal, CreateMedicationOrderRequest request) {
        accessService.assertCanManageMedicationOrders(principal);
        UUID tenantId = principal.getTenantId();

        ClinicalOrderEntity clinicalOrder = clinicalOrderRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getClinicalOrderId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Clinical order not found"));

        if (!"MEDICATION".equals(clinicalOrder.getOrderType())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order is not a MEDICATION order");
        }

        if (!ClinicalOrderStatus.ORDERED.name().equals(clinicalOrder.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order is not in ORDERED status");
        }

        if (medicationOrderRepository.findByClinicalOrderIdAndDeletedAtIsNull(clinicalOrder.getId()).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Medication order already exists for this clinical order");
        }

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(clinicalOrder.getEncounterId(), tenantId)
                .orElseThrow();

        accessService.assertHospitalScope(principal, encounter.getHospitalId());

        List<ClinicalOrderItemEntity> clinicalItems = clinicalOrderItemRepository
                .findByOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(clinicalOrder.getId());
        if (clinicalItems.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Clinical order has no items");
        }

        MedicationOrderEntity order = new MedicationOrderEntity();
        order.setTenantId(tenantId);
        order.setClinicalOrderId(clinicalOrder.getId());
        order.setEncounterId(encounter.getId());
        order.setPatientId(encounter.getPatientId());
        order.setHospitalId(encounter.getHospitalId());
        order.setBranchId(encounter.getBranchId());
        order.setStatus(MedicationOrderStatus.RECEIVED.name());
        order.setReceivedAt(Instant.now());
        order.setCreatedBy(principal.getUserId());
        order.setUpdatedBy(principal.getUserId());
        MedicationOrderEntity savedOrder = medicationOrderRepository.save(order);

        for (ClinicalOrderItemEntity clinicalItem : clinicalItems) {
            if (!ClinicalOrderStatus.ORDERED.name().equals(clinicalItem.getStatus())) {
                continue;
            }
            MedicationOrderItemEntity item = new MedicationOrderItemEntity();
            item.setTenantId(tenantId);
            item.setMedicationOrderId(savedOrder.getId());
            item.setClinicalOrderItemId(clinicalItem.getId());
            item.setMedicineId(clinicalItem.getItemReferenceId());
            item.setMedicineName(clinicalItem.getItemName());
            item.setInstructions(clinicalItem.getInstructions());
            item.setStatus(MedicationOrderItemStatus.RECEIVED.name());
            item.setCreatedBy(principal.getUserId());
            item.setUpdatedBy(principal.getUserId());
            medicationOrderItemRepository.save(item);

            clinicalItem.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
            clinicalItem.setUpdatedBy(principal.getUserId());
            clinicalOrderItemRepository.save(clinicalItem);
        }

        clinicalOrder.setStatus(ClinicalOrderStatus.IN_PROGRESS.name());
        clinicalOrder.setUpdatedBy(principal.getUserId());
        clinicalOrderRepository.save(clinicalOrder);

        auditLogService.record(tenantId, principal.getUserId(), "MEDICATION_ORDER_CREATED",
                "MedicationOrder", savedOrder.getId(),
                Map.of("clinicalOrderId", clinicalOrder.getId().toString()));

        return buildOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<MedicationOrderResponse> listMedicationOrders(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanReadMedicationOrders(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        Page<MedicationOrderEntity> page = status != null && !status.isBlank()
                ? medicationOrderRepository
                        .findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByReceivedAtDesc(
                                tenantId, hospitalId, branchId, status, pageable)
                : medicationOrderRepository
                        .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByReceivedAtDesc(
                                tenantId, hospitalId, branchId, pageable);

        return page.map(this::buildOrderResponse);
    }

    @Transactional(readOnly = true)
    public MedicationOrderResponse getMedicationOrder(UserPrincipal principal, UUID medicationOrderId) {
        accessService.assertCanReadMedicationOrders(principal);
        MedicationOrderEntity order = requireOrder(principal.getTenantId(), medicationOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());
        return buildOrderResponse(order);
    }

    @Transactional
    public MedicationOrderResponse verifyMedicationOrder(UserPrincipal principal, UUID medicationOrderId) {
        accessService.assertCanManageMedicationOrders(principal);
        UUID tenantId = principal.getTenantId();
        MedicationOrderEntity order = requireOrder(tenantId, medicationOrderId);
        accessService.assertHospitalScope(principal, order.getHospitalId());

        if (!MedicationOrderStatus.RECEIVED.name().equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Medication order is not in RECEIVED status");
        }

        List<MedicationOrderItemEntity> items = medicationOrderItemRepository
                .findByMedicationOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(order.getId());
        for (MedicationOrderItemEntity item : items) {
            item.setStatus(MedicationOrderItemStatus.VERIFIED.name());
            item.setUpdatedBy(principal.getUserId());
            medicationOrderItemRepository.save(item);
        }

        order.setStatus(MedicationOrderStatus.VERIFIED.name());
        order.setVerifiedAt(Instant.now());
        order.setVerifiedBy(principal.getUserId());
        order.setUpdatedBy(principal.getUserId());
        medicationOrderRepository.save(order);

        auditLogService.record(tenantId, principal.getUserId(), "MEDICATION_ORDER_VERIFIED",
                "MedicationOrder", order.getId(), Map.of());

        return buildOrderResponse(order);
    }

    @Transactional
    public MedicationOrderResponse planOrderItem(
            UserPrincipal principal, UUID orderItemId, PlanMedicationOrderItemRequest request) {
        accessService.assertCanManageMedicationOrders(principal);
        UUID tenantId = principal.getTenantId();

        MedicationOrderItemEntity item = medicationOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(orderItemId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medication order item not found"));

        MedicationOrderEntity order = requireOrder(tenantId, item.getMedicationOrderId());
        accessService.assertHospitalScope(principal, order.getHospitalId());

        if (!MedicationOrderStatus.VERIFIED.name().equals(order.getStatus())
                && !MedicationOrderStatus.ACTIVE.name().equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Medication order must be verified before planning dispense");
        }

        if (!MedicationOrderItemStatus.VERIFIED.name().equals(item.getStatus())
                && !MedicationOrderItemStatus.READY.name().equals(item.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Order item must be verified before planning dispense");
        }

        item.setDoseText(request.getDoseText());
        item.setRoute(request.getRoute());
        item.setFrequency(request.getFrequency());
        item.setDurationDays(request.getDurationDays());
        if (request.getInstructions() != null) {
            item.setInstructions(request.getInstructions());
        }
        item.setStatus(MedicationOrderItemStatus.READY.name());
        item.setPlannedAt(Instant.now());
        item.setUpdatedBy(principal.getUserId());
        medicationOrderItemRepository.save(item);

        if (MedicationOrderStatus.VERIFIED.name().equals(order.getStatus())) {
            order.setStatus(MedicationOrderStatus.ACTIVE.name());
            order.setUpdatedBy(principal.getUserId());
            medicationOrderRepository.save(order);
        }

        return buildOrderResponse(order);
    }

    @Transactional
    public MedicationAdministrationResponse administerMedication(
            UserPrincipal principal, UUID orderItemId, AdministerMedicationRequest request) {
        accessService.assertCanAdministerMedication(principal);
        UUID tenantId = principal.getTenantId();

        MedicationOrderItemEntity item = medicationOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(orderItemId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medication order item not found"));

        MedicationOrderEntity order = requireOrder(tenantId, item.getMedicationOrderId());
        accessService.assertHospitalScope(principal, order.getHospitalId());

        if (!MedicationOrderItemStatus.READY.name().equals(item.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Order item must be READY before administration");
        }

        MedicationAdministrationEntity administration = new MedicationAdministrationEntity();
        administration.setTenantId(tenantId);
        administration.setMedicationOrderItemId(item.getId());
        administration.setMedicationOrderId(order.getId());
        administration.setEncounterId(order.getEncounterId());
        administration.setPatientId(order.getPatientId());
        administration.setDoseGiven(request.getDoseGiven().trim());
        administration.setRoute(request.getRoute() != null ? request.getRoute() : item.getRoute());
        administration.setAdministeredAt(Instant.now());
        administration.setAdministeredBy(principal.getUserId());
        administration.setNotes(request.getNotes());
        administration.setCreatedBy(principal.getUserId());
        administration.setUpdatedBy(principal.getUserId());

        MedicationAdministrationEntity saved = administrationRepository.save(administration);

        if (MedicationOrderStatus.VERIFIED.name().equals(order.getStatus())) {
            order.setStatus(MedicationOrderStatus.ACTIVE.name());
            order.setUpdatedBy(principal.getUserId());
            medicationOrderRepository.save(order);
        }

        auditLogService.record(tenantId, principal.getUserId(), "MEDICATION_ADMINISTERED",
                "MedicationAdministration", saved.getId(),
                Map.of("medicationOrderItemId", item.getId().toString(),
                        "encounterId", order.getEncounterId().toString()));

        return mapper.toAdministrationResponse(saved, item.getMedicineName());
    }

    @Transactional
    public MedicationOrderResponse completeOrderItem(UserPrincipal principal, UUID orderItemId) {
        accessService.assertCanManageMedicationOrders(principal);
        UUID tenantId = principal.getTenantId();

        MedicationOrderItemEntity item = medicationOrderItemRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(orderItemId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medication order item not found"));

        MedicationOrderEntity order = requireOrder(tenantId, item.getMedicationOrderId());
        accessService.assertHospitalScope(principal, order.getHospitalId());

        if (!MedicationOrderItemStatus.READY.name().equals(item.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Order item must be READY before completion");
        }

        long adminCount = administrationRepository
                .findByMedicationOrderItemIdAndDeletedAtIsNullOrderByAdministeredAtDesc(item.getId()).size();
        if (adminCount == 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "At least one administration record is required before completion");
        }

        item.setStatus(MedicationOrderItemStatus.COMPLETED.name());
        item.setCompletedAt(Instant.now());
        item.setUpdatedBy(principal.getUserId());
        medicationOrderItemRepository.save(item);

        maybeCompleteOrder(order, tenantId, principal.getUserId());

        return buildOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<MedicationAdministrationResponse> listEncounterAdministrations(
            UserPrincipal principal, UUID encounterId) {
        UUID tenantId = principal.getTenantId();
        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
        encounterAccessService.assertCanReadEncounter(principal, encounter);

        return administrationRepository.findByEncounterIdAndDeletedAtIsNullOrderByAdministeredAtDesc(encounterId)
                .stream()
                .map(admin -> {
                    MedicationOrderItemEntity item = medicationOrderItemRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(
                                    admin.getMedicationOrderItemId(), principal.getTenantId())
                            .orElse(null);
                    String medicineName = item != null ? item.getMedicineName() : "Medication";
                    return mapper.toAdministrationResponse(admin, medicineName);
                })
                .toList();
    }

    private void maybeCompleteOrder(MedicationOrderEntity order, UUID tenantId, UUID userId) {
        long incomplete = medicationOrderItemRepository.countByMedicationOrderIdAndDeletedAtIsNullAndStatusNot(
                order.getId(), MedicationOrderItemStatus.COMPLETED.name());
        if (incomplete == 0) {
            order.setStatus(MedicationOrderStatus.COMPLETED.name());
            order.setCompletedAt(Instant.now());
            order.setUpdatedBy(userId);
            medicationOrderRepository.save(order);

            clinicalOrderRepository.findByIdAndTenantIdAndDeletedAtIsNull(order.getClinicalOrderId(), tenantId)
                    .ifPresent(clinicalOrder -> {
                        clinicalOrder.setStatus(ClinicalOrderStatus.COMPLETED.name());
                        clinicalOrder.setUpdatedBy(userId);
                        clinicalOrderRepository.save(clinicalOrder);

                        clinicalOrderItemRepository
                                .findByOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(clinicalOrder.getId())
                                .forEach(clinicalItem -> {
                                    if (!ClinicalOrderStatus.COMPLETED.name().equals(clinicalItem.getStatus())) {
                                        clinicalItem.setStatus(ClinicalOrderStatus.COMPLETED.name());
                                        clinicalItem.setUpdatedBy(userId);
                                        clinicalOrderItemRepository.save(clinicalItem);
                                    }
                                });
                    });
        }
    }

    private MedicationOrderEntity requireOrder(UUID tenantId, UUID medicationOrderId) {
        return medicationOrderRepository.findByIdAndTenantIdAndDeletedAtIsNull(medicationOrderId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medication order not found"));
    }

    private MedicationOrderResponse buildOrderResponse(MedicationOrderEntity order) {
        List<MedicationOrderItemResponse> items = medicationOrderItemRepository
                .findByMedicationOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(order.getId())
                .stream()
                .map(item -> {
                    List<MedicationAdministrationResponse> admins = administrationRepository
                            .findByMedicationOrderItemIdAndDeletedAtIsNullOrderByAdministeredAtDesc(item.getId())
                            .stream()
                            .map(a -> mapper.toAdministrationResponse(a, item.getMedicineName()))
                            .toList();
                    return mapper.toOrderItemResponse(item, admins);
                })
                .toList();
        return mapper.toOrderResponse(order, items);
    }
}
