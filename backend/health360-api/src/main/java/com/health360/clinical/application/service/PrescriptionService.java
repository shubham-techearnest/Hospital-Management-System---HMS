package com.health360.clinical.application.service;

import com.health360.clinical.domain.PrescriptionStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionEntity;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionItemEntity;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.clinical.presentation.dto.request.CreatePrescriptionRequest;
import com.health360.clinical.presentation.dto.request.UpdatePrescriptionRequest;
import com.health360.clinical.presentation.dto.response.PrescriptionResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.pharmacy.infrastructure.persistence.entity.MedicineEntity;
import com.health360.pharmacy.infrastructure.persistence.repository.MedicineRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private static final int MAX_ITEMS = 20;

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository itemRepository;
    private final MedicineRepository medicineRepository;
    private final EncounterService encounterService;
    private final EncounterAccessService accessService;
    private final ClinicalMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public PrescriptionResponse create(
            UserPrincipal principal, UUID encounterId, CreatePrescriptionRequest request) {
        requireWrite(principal);
        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);
        validateItems(request.getItems());

        PrescriptionEntity rx = new PrescriptionEntity();
        rx.setTenantId(principal.getTenantId());
        rx.setEncounterId(encounterId);
        rx.setPatientId(encounter.getPatientId());
        rx.setHospitalId(encounter.getHospitalId());
        rx.setBranchId(encounter.getBranchId());
        rx.setPrescriptionNumber(generateNumber(principal.getTenantId()));
        rx.setStatus(PrescriptionStatus.DRAFT.name());
        rx.setNotes(trimToNull(request.getNotes()));
        rx.setPrescribedBy(principal.getUserId());
        rx.setCreatedBy(principal.getUserId());
        rx.setUpdatedBy(principal.getUserId());

        PrescriptionEntity saved = prescriptionRepository.save(rx);
        List<PrescriptionItemEntity> items = saveItems(
                principal, saved, encounter, request.getItems());

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "PRESCRIPTION_CREATED", "Prescription", saved.getId(),
                Map.of("encounterId", encounterId.toString(), "status", saved.getStatus()));

        return mapper.toPrescriptionResponse(saved, items);
    }

    @Transactional
    public PrescriptionResponse update(
            UserPrincipal principal, UUID encounterId, UUID prescriptionId, UpdatePrescriptionRequest request) {
        requireWrite(principal);
        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        PrescriptionEntity rx = requirePrescription(principal.getTenantId(), prescriptionId, encounterId);
        if (!PrescriptionStatus.DRAFT.name().equals(rx.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.CONFLICT,
                    "Only DRAFT prescriptions can be updated");
        }
        validateItems(request.getItems());

        softDeleteItems(rx.getId(), principal.getUserId());
        rx.setNotes(trimToNull(request.getNotes()));
        rx.setUpdatedBy(principal.getUserId());
        PrescriptionEntity saved = prescriptionRepository.save(rx);
        List<PrescriptionItemEntity> items = saveItems(principal, saved, encounter, request.getItems());

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "PRESCRIPTION_UPDATED", "Prescription", saved.getId(),
                Map.of("encounterId", encounterId.toString()));

        return mapper.toPrescriptionResponse(saved, items);
    }

    @Transactional
    public PrescriptionResponse sign(UserPrincipal principal, UUID encounterId, UUID prescriptionId) {
        if (!principal.hasPermission("clinical:prescription:sign")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        PrescriptionEntity rx = requirePrescription(principal.getTenantId(), prescriptionId, encounterId);
        if (!PrescriptionStatus.DRAFT.name().equals(rx.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.CONFLICT,
                    "Only DRAFT prescriptions can be signed");
        }

        List<PrescriptionItemEntity> items =
                itemRepository.findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(rx.getId());
        if (items.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Prescription must have at least one item");
        }

        applySafetyStubs(items, principal.getUserId());

        rx.setStatus(PrescriptionStatus.SIGNED.name());
        rx.setSignedAt(Instant.now());
        rx.setSignedBy(principal.getUserId());
        rx.setPrescribedBy(principal.getUserId());
        rx.setUpdatedBy(principal.getUserId());
        PrescriptionEntity saved = prescriptionRepository.save(rx);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "PRESCRIPTION_SIGNED", "Prescription", saved.getId(),
                Map.of("encounterId", encounterId.toString(),
                        "prescriptionNumber", saved.getPrescriptionNumber()));

        return mapper.toPrescriptionResponse(saved, items);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> listForEncounter(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);
        return prescriptionRepository.findByEncounterIdAndDeletedAtIsNullOrderByCreatedAtDesc(encounterId)
                .stream()
                .map(rx -> mapper.toPrescriptionResponse(rx,
                        itemRepository.findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(rx.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse get(UserPrincipal principal, UUID encounterId, UUID prescriptionId) {
        EncounterEntity encounter = encounterService.requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);
        PrescriptionEntity rx = requirePrescription(principal.getTenantId(), prescriptionId, encounterId);
        return mapper.toPrescriptionResponse(rx,
                itemRepository.findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(rx.getId()));
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> listMySigned(UserPrincipal principal) {
        UUID patientId = accessService.resolvePatientProfileIdForUser(principal.getUserId(), principal.getTenantId());
        if (patientId == null) {
            return List.of();
        }
        return prescriptionRepository
                .findByTenantIdAndPatientIdAndStatusAndDeletedAtIsNullOrderBySignedAtDesc(
                        principal.getTenantId(), patientId, PrescriptionStatus.SIGNED.name())
                .stream()
                .map(rx -> mapper.toPrescriptionResponse(rx,
                        itemRepository.findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(rx.getId())))
                .toList();
    }

    private PrescriptionEntity requirePrescription(UUID tenantId, UUID prescriptionId, UUID encounterId) {
        PrescriptionEntity rx = prescriptionRepository.findByIdAndTenantIdAndDeletedAtIsNull(prescriptionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Prescription not found"));
        if (!rx.getEncounterId().equals(encounterId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Prescription does not belong to this encounter");
        }
        return rx;
    }

    private void requireWrite(UserPrincipal principal) {
        if (!principal.hasPermission("clinical:prescription:write")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void validateItems(List<CreatePrescriptionRequest.PrescriptionItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "At least one prescription item is required");
        }
        if (items.size() > MAX_ITEMS) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Maximum " + MAX_ITEMS + " items per prescription");
        }
    }

    private List<PrescriptionItemEntity> saveItems(
            UserPrincipal principal,
            PrescriptionEntity rx,
            EncounterEntity encounter,
            List<CreatePrescriptionRequest.PrescriptionItemRequest> requests) {
        List<PrescriptionItemEntity> entities = new ArrayList<>();
        int order = 0;
        for (CreatePrescriptionRequest.PrescriptionItemRequest req : requests) {
            entities.add(toItemEntity(principal, rx, encounter, req, order++));
        }
        return itemRepository.saveAll(entities);
    }

    private PrescriptionItemEntity toItemEntity(
            UserPrincipal principal,
            PrescriptionEntity rx,
            EncounterEntity encounter,
            CreatePrescriptionRequest.PrescriptionItemRequest req,
            int sortOrder) {
        String medicineName = trimToNull(req.getMedicineName());
        String medicineCode = trimToNull(req.getMedicineCode());
        UUID medicineId = req.getMedicineId();

        if (medicineId != null) {
            MedicineEntity medicine = medicineRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(medicineId, principal.getTenantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Medicine not found"));
            if (!medicine.getHospitalId().equals(encounter.getHospitalId())
                    || !medicine.getBranchId().equals(encounter.getBranchId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Medicine does not belong to this hospital branch");
            }
            medicineName = medicine.getName();
            medicineCode = medicine.getCode();
            if (req.getRoute() == null || req.getRoute().isBlank()) {
                // keep route from request null; default applied below if needed
            }
        }
        if (medicineName == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "medicineName or medicineId is required");
        }

        PrescriptionItemEntity item = new PrescriptionItemEntity();
        item.setTenantId(principal.getTenantId());
        item.setPrescriptionId(rx.getId());
        item.setMedicineId(medicineId);
        item.setMedicineCode(medicineCode);
        item.setMedicineName(medicineName);
        item.setDoseText(trimToNull(req.getDoseText()));
        item.setRoute(trimToNull(req.getRoute()));
        item.setFrequency(trimToNull(req.getFrequency()));
        item.setDurationDays(req.getDurationDays());
        item.setQuantity(req.getQuantity() != null && req.getQuantity() > 0 ? req.getQuantity() : 1);
        item.setInstructions(trimToNull(req.getInstructions()));
        item.setSafetyWarning(trimToNull(req.getSafetyWarning()));
        item.setSortOrder(sortOrder);
        item.setCreatedBy(principal.getUserId());
        item.setUpdatedBy(principal.getUserId());
        return item;
    }

    private void softDeleteItems(UUID prescriptionId, UUID userId) {
        List<PrescriptionItemEntity> existing =
                itemRepository.findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(prescriptionId);
        Instant now = Instant.now();
        for (PrescriptionItemEntity item : existing) {
            item.setDeletedAt(now);
            item.setUpdatedBy(userId);
        }
        itemRepository.saveAll(existing);
    }

    /** DEC-007 stub: warn when dose/frequency missing at sign time. */
    private void applySafetyStubs(List<PrescriptionItemEntity> items, UUID userId) {
        for (PrescriptionItemEntity item : items) {
            if (item.getSafetyWarning() != null && !item.getSafetyWarning().isBlank()) {
                continue;
            }
            if (item.getDoseText() == null || item.getDoseText().isBlank()
                    || item.getFrequency() == null || item.getFrequency().isBlank()) {
                item.setSafetyWarning("WARN: Confirm dose and frequency before dispensing");
                item.setUpdatedBy(userId);
            }
        }
        itemRepository.saveAll(items);
    }

    private String generateNumber(UUID tenantId) {
        Instant startOfYear = LocalDate.now(ZoneOffset.UTC).withDayOfYear(1)
                .atStartOfDay().toInstant(ZoneOffset.UTC);
        long seq = prescriptionRepository.countByTenantIdAndCreatedAtGreaterThanEqualAndDeletedAtIsNull(
                tenantId, startOfYear) + 1;
        return String.format("RX-%d-%05d", LocalDate.now(ZoneOffset.UTC).getYear(), seq);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
