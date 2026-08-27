package com.health360.pharmacy.application.service;

import com.health360.clinical.domain.PrescriptionStatus;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionEntity;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionItemEntity;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.pharmacy.domain.PharmacyRequestItemAvailability;
import com.health360.pharmacy.domain.PharmacyRequestStatus;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestItemEntity;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestItemRepository;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestRepository;
import com.health360.pharmacy.presentation.dto.request.PharmacyRequestNotesRequest;
import com.health360.pharmacy.presentation.dto.response.PharmacyRequestItemResponse;
import com.health360.pharmacy.presentation.dto.response.PharmacyRequestResponse;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PharmacyRequestService {

    private final PharmacyRequestRepository requestRepository;
    private final PharmacyRequestItemRepository requestItemRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PharmacyAccessService accessService;
    private final AuditLogService auditLogService;
    private final TransactionalNotificationService notificationService;

    @Transactional(readOnly = true)
    public List<PharmacyRequestResponse> listMyRequests(UserPrincipal principal) {
        accessService.assertCanReadPharmacyRequests(principal);
        PatientProfileEntity profile = requirePatientProfile(principal);
        return requestRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), profile.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PharmacyRequestResponse> listWorklist(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status) {
        accessService.assertCanReadPharmacyRequests(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        UUID tenantId = principal.getTenantId();
        List<PharmacyRequestEntity> requests = (status == null || status.isBlank())
                ? requestRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                        tenantId, hospitalId, branchId)
                : requestRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
                        tenantId, hospitalId, branchId, status.trim().toUpperCase());
        return requests.stream().map(this::toResponse).toList();
    }

    @Transactional
    public PharmacyRequestResponse sendHospital(UserPrincipal principal, UUID prescriptionId) {
        accessService.assertCanWritePharmacyRequests(principal);
        PatientProfileEntity profile = requirePatientProfile(principal);
        UUID tenantId = principal.getTenantId();

        PrescriptionEntity rx = prescriptionRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(prescriptionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Prescription not found"));

        if (!rx.getPatientId().equals(profile.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        if (!PrescriptionStatus.SIGNED.name().equals(rx.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only signed prescriptions can be sent to pharmacy");
        }
        if (requestRepository.findByPrescriptionIdAndDeletedAtIsNullAndStatusNot(
                prescriptionId, PharmacyRequestStatus.CANCELLED.name()).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "An active pharmacy request already exists for this prescription");
        }

        List<PrescriptionItemEntity> rxItems =
                prescriptionItemRepository.findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(rx.getId());
        if (rxItems.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Prescription has no medicines to dispense");
        }

        Instant now = Instant.now();
        PharmacyRequestEntity request = new PharmacyRequestEntity();
        request.setTenantId(tenantId);
        request.setPrescriptionId(rx.getId());
        request.setEncounterId(rx.getEncounterId());
        request.setPatientId(rx.getPatientId());
        request.setHospitalId(rx.getHospitalId());
        request.setBranchId(rx.getBranchId());
        request.setRequestNumber(nextRequestNumber(tenantId));
        request.setStatus(PharmacyRequestStatus.REQUESTED.name());
        request.setRequestedAt(now);
        request.setRequestedBy(principal.getUserId());
        request.setCreatedBy(principal.getUserId());
        request.setUpdatedBy(principal.getUserId());
        PharmacyRequestEntity saved = requestRepository.save(request);

        for (PrescriptionItemEntity rxItem : rxItems) {
            PharmacyRequestItemEntity item = new PharmacyRequestItemEntity();
            item.setTenantId(tenantId);
            item.setPharmacyRequestId(saved.getId());
            item.setPrescriptionItemId(rxItem.getId());
            item.setMedicineId(rxItem.getMedicineId());
            item.setMedicineName(rxItem.getMedicineName());
            item.setQuantityRequested(rxItem.getQuantity() != null ? rxItem.getQuantity() : 1);
            item.setQuantityDispensed(0);
            item.setAvailabilityStatus(PharmacyRequestItemAvailability.PENDING.name());
            item.setCreatedBy(principal.getUserId());
            item.setUpdatedBy(principal.getUserId());
            requestItemRepository.save(item);
        }

        auditLogService.record(tenantId, principal.getUserId(), "PHARMACY_REQUEST_CREATED",
                "PharmacyRequest", saved.getId(),
                Map.of("prescriptionId", prescriptionId.toString(), "requestNumber", saved.getRequestNumber()));

        return toResponse(saved);
    }

    @Transactional
    public PharmacyRequestResponse receive(UserPrincipal principal, UUID requestId) {
        return transition(principal, requestId, PharmacyRequestStatus.REQUESTED, PharmacyRequestStatus.RECEIVED, (req, now) -> {
            req.setReceivedAt(now);
        });
    }

    @Transactional
    public PharmacyRequestResponse startReview(UserPrincipal principal, UUID requestId, PharmacyRequestNotesRequest notes) {
        return transition(principal, requestId, PharmacyRequestStatus.RECEIVED, PharmacyRequestStatus.UNDER_REVIEW, (req, now) -> {
            req.setUnderReviewAt(now);
            req.setReviewedBy(principal.getUserId());
            if (notes != null && notes.getNotes() != null && !notes.getNotes().isBlank()) {
                req.setPharmacistNotes(notes.getNotes().trim());
            }
        });
    }

    @Transactional
    public PharmacyRequestResponse markReady(UserPrincipal principal, UUID requestId, PharmacyRequestNotesRequest notes) {
        PharmacyRequestResponse response = transition(
                principal, requestId, PharmacyRequestStatus.UNDER_REVIEW, PharmacyRequestStatus.READY, (req, now) -> {
                    req.setReadyAt(now);
                    if (notes != null && notes.getNotes() != null && !notes.getNotes().isBlank()) {
                        req.setPharmacistNotes(notes.getNotes().trim());
                    }
                    markItemsReady(req.getId(), principal.getUserId());
                });

        PatientProfileEntity patient = patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(response.getPatientId(), principal.getTenantId())
                .orElse(null);
        if (patient != null) {
            notificationService.send(
                    principal.getTenantId(),
                    patient.getUserId(),
                    NotificationType.PHARMACY_MEDICINE_READY,
                    "Medicines ready",
                    "Your prescription " + response.getPrescriptionNumber()
                            + " is ready for collection at the hospital pharmacy.",
                    "PharmacyRequest",
                    response.getPharmacyRequestId());
        }
        return response;
    }

    @Transactional
    public PharmacyRequestResponse dispense(UserPrincipal principal, UUID requestId) {
        return transition(principal, requestId, PharmacyRequestStatus.READY, PharmacyRequestStatus.DISPENSED, (req, now) -> {
            req.setDispensedAt(now);
            req.setDispensedBy(principal.getUserId());
            markItemsDispensed(req.getId(), principal.getUserId());
        });
    }

    private PharmacyRequestResponse transition(
            UserPrincipal principal,
            UUID requestId,
            PharmacyRequestStatus expected,
            PharmacyRequestStatus next,
            TransitionMutator mutator) {
        accessService.assertCanFulfillPharmacyRequests(principal);
        UUID tenantId = principal.getTenantId();
        PharmacyRequestEntity request = requestRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(requestId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Pharmacy request not found"));
        accessService.assertHospitalScope(principal, request.getHospitalId());

        if (!expected.name().equals(request.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.CONFLICT,
                    "Pharmacy request must be " + expected.name() + " to move to " + next.name());
        }

        Instant now = Instant.now();
        mutator.apply(request, now);
        request.setStatus(next.name());
        request.setUpdatedBy(principal.getUserId());
        PharmacyRequestEntity saved = requestRepository.save(request);

        auditLogService.record(tenantId, principal.getUserId(), "PHARMACY_REQUEST_" + next.name(),
                "PharmacyRequest", saved.getId(), Map.of("from", expected.name(), "to", next.name()));

        return toResponse(saved);
    }

    private void markItemsReady(UUID requestId, UUID userId) {
        for (PharmacyRequestItemEntity item :
                requestItemRepository.findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(requestId)) {
            item.setAvailabilityStatus(PharmacyRequestItemAvailability.AVAILABLE.name());
            item.setUpdatedBy(userId);
            requestItemRepository.save(item);
        }
    }

    private void markItemsDispensed(UUID requestId, UUID userId) {
        for (PharmacyRequestItemEntity item :
                requestItemRepository.findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(requestId)) {
            item.setAvailabilityStatus(PharmacyRequestItemAvailability.DISPENSED.name());
            item.setQuantityDispensed(item.getQuantityRequested());
            item.setUpdatedBy(userId);
            requestItemRepository.save(item);
        }
    }

    private PharmacyRequestResponse toResponse(PharmacyRequestEntity request) {
        PrescriptionEntity rx = prescriptionRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getPrescriptionId(), request.getTenantId())
                .orElse(null);
        PatientProfileEntity patient = patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getPatientId(), request.getTenantId())
                .orElse(null);

        List<PharmacyRequestItemResponse> items = requestItemRepository
                .findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(request.getId())
                .stream()
                .map(item -> PharmacyRequestItemResponse.builder()
                        .itemId(item.getId())
                        .prescriptionItemId(item.getPrescriptionItemId())
                        .medicineId(item.getMedicineId())
                        .medicineName(item.getMedicineName())
                        .quantityRequested(item.getQuantityRequested())
                        .quantityDispensed(item.getQuantityDispensed())
                        .availabilityStatus(item.getAvailabilityStatus())
                        .notes(item.getNotes())
                        .build())
                .toList();

        String patientName = null;
        if (patient != null) {
            patientName = ((patient.getLegalFirstName() == null ? "" : patient.getLegalFirstName()) + " "
                    + (patient.getLegalLastName() == null ? "" : patient.getLegalLastName())).trim();
            if (patientName.isBlank()) {
                patientName = patient.getUhid();
            }
        }

        return PharmacyRequestResponse.builder()
                .pharmacyRequestId(request.getId())
                .requestNumber(request.getRequestNumber())
                .prescriptionId(request.getPrescriptionId())
                .prescriptionNumber(rx != null ? rx.getPrescriptionNumber() : null)
                .encounterId(request.getEncounterId())
                .patientId(request.getPatientId())
                .patientName(patientName)
                .uhid(patient != null ? patient.getUhid() : null)
                .hospitalId(request.getHospitalId())
                .branchId(request.getBranchId())
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .receivedAt(request.getReceivedAt())
                .underReviewAt(request.getUnderReviewAt())
                .readyAt(request.getReadyAt())
                .dispensedAt(request.getDispensedAt())
                .dispensedBy(request.getDispensedBy())
                .pharmacistNotes(request.getPharmacistNotes())
                .canSendHospital(false)
                .items(items)
                .build();
    }

    private String nextRequestNumber(UUID tenantId) {
        Instant startOfYear = LocalDate.now(ZoneOffset.UTC).withDayOfYear(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        long seq = requestRepository.countByTenantIdAndRequestedAtGreaterThanEqualAndDeletedAtIsNull(tenantId, startOfYear) + 1;
        return String.format("PHR-%d-%05d", LocalDate.now(ZoneOffset.UTC).getYear(), seq);
    }

    private PatientProfileEntity requirePatientProfile(UserPrincipal principal) {
        return patientProfileRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNull(principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));
    }

    @FunctionalInterface
    private interface TransitionMutator {
        void apply(PharmacyRequestEntity request, Instant now);
    }
}
