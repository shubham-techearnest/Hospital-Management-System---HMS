package com.health360.opd.application.service;

import com.health360.billing.domain.InvoiceStatus;
import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.UpdateEncounterStatusRequest;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.opd.domain.QueueEntryStatus;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.opd.presentation.dto.request.OpdQueueActionRequest;
import com.health360.opd.presentation.dto.request.SkipQueueEntryRequest;
import com.health360.opd.presentation.dto.response.OpdQueueEntryResponse;
import com.health360.clinical.application.service.EncounterService;
import com.health360.patient.application.service.PatientDisplayNameResolver;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OpdQueueService {

    private static final int APPROACHING_THRESHOLD = 3;

    private final OpdQueueEntryRepository queueEntryRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterService encounterService;
    private final OpdDeskService deskService;
    private final OpdAccessService opdAccessService;
    private final OpdMapper opdMapper;
    private final AuditLogService auditLogService;
    private final HospitalAssociationRepository hospitalAssociationRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PatientDisplayNameResolver patientDisplayNameResolver;
    private final InvoiceRepository invoiceRepository;
    private final TransactionalNotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<OpdQueueEntryResponse> listQueue(
            UserPrincipal principal,
            UUID hospitalId,
            UUID branchId,
            LocalDate queueDate,
            String status,
            UUID deskId,
            Pageable pageable) {

        opdAccessService.assertCanReadQueue(principal);
        opdAccessService.assertHospitalScope(principal, hospitalId, branchId);

        UUID tenantId = principal.getTenantId();
        LocalDate effectiveDate = queueDate != null ? queueDate : LocalDate.now(ZoneId.systemDefault());
        String normalizedStatus = normalizeStatus(status);

        Page<OpdQueueEntryEntity> page = queueEntryRepository.findQueuePage(
                        tenantId, hospitalId, branchId, effectiveDate, normalizedStatus, deskId, pageable);
        return toQueueResponsePage(tenantId, page);
    }

    @Transactional
    public OpdQueueEntryResponse callPatient(
            UserPrincipal principal, UUID queueEntryId, OpdQueueActionRequest request) {
        opdAccessService.assertCanWriteQueue(principal);
        return transitionQueueEntry(
                principal, queueEntryId, request, QueueEntryStatus.CALLED, null);
    }

    @Transactional
    public OpdQueueEntryResponse startService(
            UserPrincipal principal, UUID queueEntryId, OpdQueueActionRequest request) {
        opdAccessService.assertCanWriteQueue(principal);
        return transitionQueueEntry(
                principal, queueEntryId, request, QueueEntryStatus.IN_SERVICE,
                EncounterStatus.IN_PROGRESS);
    }

    @Transactional
    public OpdQueueEntryResponse completeService(
            UserPrincipal principal, UUID queueEntryId) {
        opdAccessService.assertCanWriteQueue(principal);
        return transitionQueueEntry(
                principal, queueEntryId, null, QueueEntryStatus.COMPLETED,
                EncounterStatus.COMPLETED);
    }

    @Transactional
    public OpdQueueEntryResponse cancelEntry(UserPrincipal principal, UUID queueEntryId) {
        opdAccessService.assertCanWriteQueue(principal);
        OpdQueueEntryEntity entry = requireQueueEntry(principal, queueEntryId);
        QueueEntryStatus current = parseQueueStatus(entry.getStatus());

        if (!current.canTransitionTo(QueueEntryStatus.CANCELLED)) {
            throw invalidTransition(current, QueueEntryStatus.CANCELLED);
        }

        entry.setStatus(QueueEntryStatus.CANCELLED.name());
        entry.setUpdatedBy(principal.getUserId());
        queueEntryRepository.save(entry);

        EncounterEntity encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
        EncounterStatus encounterStatus = EncounterStatus.valueOf(encounter.getStatus());
        if (encounterStatus.canTransitionTo(EncounterStatus.CANCELLED)) {
            UpdateEncounterStatusRequest statusRequest = new UpdateEncounterStatusRequest();
            statusRequest.setStatus(EncounterStatus.CANCELLED.name());
            encounterService.updateEncounterStatus(principal, encounter.getId(), statusRequest);
            encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
        }

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "OPD_QUEUE_CANCELLED", "OpdQueueEntry", entry.getId(), Map.of());

        return toQueueResponse(principal.getTenantId(), entry, encounter);
    }

    @Transactional
    public OpdQueueEntryResponse skipPatient(
            UserPrincipal principal, UUID queueEntryId, SkipQueueEntryRequest request) {
        opdAccessService.assertCanWriteQueue(principal);
        OpdQueueEntryEntity entry = requireQueueEntry(principal, queueEntryId);
        QueueEntryStatus current = parseQueueStatus(entry.getStatus());

        if (!current.canTransitionTo(QueueEntryStatus.SKIPPED)) {
            throw invalidTransition(current, QueueEntryStatus.SKIPPED);
        }

        String reason = request != null ? request.getReason() : null;
        if (reason != null && reason.length() > 500) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Skip reason must be at most 500 characters");
        }

        UUID deskId = request != null ? request.getDeskId() : null;
        if (deskId != null) {
            deskService.requireActiveDesk(
                    principal.getTenantId(), deskId, entry.getHospitalId(), entry.getBranchId());
            entry.setDeskId(deskId);
        }

        Instant now = Instant.now();
        entry.setStatus(QueueEntryStatus.SKIPPED.name());
        entry.setSkippedAt(now);
        entry.setSkipReason(reason != null && !reason.isBlank() ? reason.trim() : null);
        entry.setUpdatedBy(principal.getUserId());
        queueEntryRepository.save(entry);

        EncounterEntity encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
        applyDoctorAssignment(principal, entry, encounter,
                request != null ? request.getPrimaryDoctorId() : null);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "OPD_QUEUE_SKIPPED", "OpdQueueEntry", entry.getId(),
                Map.of(
                        "priorStatus", current.name(),
                        "reason", entry.getSkipReason() != null ? entry.getSkipReason() : ""));

        return toQueueResponse(principal.getTenantId(), entry, encounter);
    }

    @Transactional
    public OpdQueueEntryResponse recallPatient(
            UserPrincipal principal, UUID queueEntryId, OpdQueueActionRequest request) {
        opdAccessService.assertCanWriteQueue(principal);
        OpdQueueEntryEntity entry = requireQueueEntry(principal, queueEntryId);
        QueueEntryStatus current = parseQueueStatus(entry.getStatus());

        if (!current.canTransitionTo(QueueEntryStatus.CALLED)) {
            throw invalidTransition(current, QueueEntryStatus.CALLED);
        }
        if (current != QueueEntryStatus.SKIPPED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Only skipped queue entries can be recalled");
        }

        UUID deskId = request != null ? request.getDeskId() : null;
        if (deskId != null) {
            deskService.requireActiveDesk(
                    principal.getTenantId(), deskId, entry.getHospitalId(), entry.getBranchId());
            entry.setDeskId(deskId);
        }

        Instant now = Instant.now();
        entry.setStatus(QueueEntryStatus.CALLED.name());
        entry.setCalledAt(now);
        entry.setRecalledAt(now);
        entry.setPriority(entry.getPriority() + 10);
        entry.setUpdatedBy(principal.getUserId());
        queueEntryRepository.save(entry);

        EncounterEntity encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
        applyDoctorAssignment(principal, entry, encounter,
                request != null ? request.getPrimaryDoctorId() : null);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "OPD_QUEUE_RECALLED", "OpdQueueEntry", entry.getId(),
                Map.of("priority", entry.getPriority()));

        notifyPatientQueueStatus(principal.getTenantId(), encounter, QueueEntryStatus.CALLED);

        return toQueueResponse(principal.getTenantId(), entry, encounter);
    }

    @Transactional
    public OpdQueueEntryResponse assignDoctor(
            UserPrincipal principal, UUID queueEntryId, UUID primaryDoctorId) {
        opdAccessService.assertCanWriteQueue(principal);
        OpdQueueEntryEntity entry = requireQueueEntry(principal, queueEntryId);
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
        applyDoctorAssignment(principal, entry, encounter, primaryDoctorId);
        return toQueueResponse(principal.getTenantId(), entry, encounter);
    }

    private OpdQueueEntryResponse transitionQueueEntry(
            UserPrincipal principal,
            UUID queueEntryId,
            OpdQueueActionRequest request,
            QueueEntryStatus targetStatus,
            EncounterStatus encounterTarget) {

        opdAccessService.assertCanWriteQueue(principal);
        OpdQueueEntryEntity entry = requireQueueEntry(principal, queueEntryId);
        QueueEntryStatus current = parseQueueStatus(entry.getStatus());

        if (!current.canTransitionTo(targetStatus)) {
            throw invalidTransition(current, targetStatus);
        }

        UUID deskId = request != null ? request.getDeskId() : null;
        if (deskId != null) {
            deskService.requireActiveDesk(
                    principal.getTenantId(), deskId, entry.getHospitalId(), entry.getBranchId());
            entry.setDeskId(deskId);
        }

        Instant now = Instant.now();
        entry.setStatus(targetStatus.name());
        entry.setUpdatedBy(principal.getUserId());

        switch (targetStatus) {
            case CALLED -> entry.setCalledAt(now);
            case IN_SERVICE -> entry.setServiceStartedAt(now);
            case COMPLETED -> entry.setCompletedAt(now);
            default -> { }
        }

        queueEntryRepository.save(entry);

        EncounterEntity encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
        applyDoctorAssignment(principal, entry, encounter,
                request != null ? request.getPrimaryDoctorId() : null);

        if (encounterTarget != null) {
            EncounterStatus currentEncounter = EncounterStatus.valueOf(encounter.getStatus());
            EncounterResponse updated;
            if (currentEncounter.canTransitionTo(encounterTarget)) {
                UpdateEncounterStatusRequest statusRequest = new UpdateEncounterStatusRequest();
                statusRequest.setStatus(encounterTarget.name());
                updated = encounterService.updateEncounterStatus(
                        principal, encounter.getId(), statusRequest);
                encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
            } else {
                updated = encounterService.getEncounter(principal, encounter.getId());
            }
            auditLogService.record(principal.getTenantId(), principal.getUserId(),
                    "OPD_QUEUE_" + targetStatus.name(), "OpdQueueEntry", entry.getId(),
                    Map.of("encounterStatus", updated.getStatus()));
            notifyPatientQueueStatus(principal.getTenantId(), encounter, targetStatus);
            maybeNotifyApproachingPatients(principal.getTenantId(), entry);
            return toQueueResponse(principal.getTenantId(), entry, encounter);
        }

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "OPD_QUEUE_" + targetStatus.name(), "OpdQueueEntry", entry.getId(), Map.of());

        notifyPatientQueueStatus(principal.getTenantId(), encounter, targetStatus);

        maybeNotifyApproachingPatients(principal.getTenantId(), entry);

        return toQueueResponse(principal.getTenantId(), entry, encounter);
    }

    private void applyDoctorAssignment(
            UserPrincipal principal,
            OpdQueueEntryEntity entry,
            EncounterEntity encounter,
            UUID primaryDoctorId) {
        if (primaryDoctorId == null) {
            return;
        }

        if (!hospitalAssociationRepository.existsByDoctorIdAndHospitalIdAndStatusAndDeletedAtIsNull(
                primaryDoctorId, entry.getHospitalId(), "ACTIVE")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Doctor must have an active association with this hospital");
        }

        encounter.setPrimaryDoctorId(primaryDoctorId);
        encounter.setUpdatedBy(principal.getUserId());
        encounterRepository.save(encounter);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "OPD_DOCTOR_ASSIGNED", "Encounter", encounter.getId(),
                Map.of(
                        "queueEntryId", entry.getId().toString(),
                        "primaryDoctorId", primaryDoctorId.toString()));
    }

    private void notifyPatientQueueStatus(
            UUID tenantId, EncounterEntity encounter, QueueEntryStatus status) {
        NotificationType type;
        String title;
        String message;
        switch (status) {
            case CALLED -> {
                type = NotificationType.OPD_CALLED;
                title = "You have been called";
                message = "Please proceed to the consultation desk.";
            }
            case IN_SERVICE -> {
                type = NotificationType.OPD_IN_SERVICE;
                title = "Consultation in progress";
                message = "Your consultation has started.";
            }
            case COMPLETED -> {
                type = NotificationType.OPD_COMPLETED;
                title = "Consultation completed";
                message = "Your consultation is complete.";
            }
            default -> {
                return;
            }
        }

        patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounter.getPatientId(), tenantId)
                .ifPresent(patient -> {
                    if (patient.getUserId() != null) {
                        notificationService.send(
                                tenantId, patient.getUserId(), type, title, message,
                                "OpdQueueEntry", encounter.getId());
                    }
                });
    }

    /**
     * G3: notify WAITING patients whose position is within threshold (once per token day).
     */
    private void maybeNotifyApproachingPatients(UUID tenantId, OpdQueueEntryEntity changedEntry) {
        List<OpdQueueEntryEntity> waiting = queueEntryRepository.findQueue(
                tenantId,
                changedEntry.getHospitalId(),
                changedEntry.getBranchId(),
                changedEntry.getQueueDate(),
                QueueEntryStatus.WAITING.name(),
                null);
        for (OpdQueueEntryEntity waitingEntry : waiting) {
            if (waitingEntry.getApproachingNotifiedAt() != null) {
                continue;
            }
            long ahead = queueEntryRepository.countWaitingAhead(
                    tenantId,
                    waitingEntry.getHospitalId(),
                    waitingEntry.getBranchId(),
                    waitingEntry.getQueueDate(),
                    waitingEntry.getTokenNumber());
            long position = ahead + 1;
            if (position > APPROACHING_THRESHOLD) {
                continue;
            }
            EncounterEntity encounter = encounterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(waitingEntry.getEncounterId(), tenantId)
                    .orElse(null);
            if (encounter == null) {
                continue;
            }
            patientProfileRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(encounter.getPatientId(), tenantId)
                    .ifPresent(patient -> {
                        if (patient.getUserId() == null) {
                            return;
                        }
                        notificationService.send(
                                tenantId,
                                patient.getUserId(),
                                NotificationType.OPD_APPROACHING,
                                "Your turn is approaching",
                                "You are number " + position + " in the OPD queue. Please stay nearby.",
                                "OpdQueueEntry",
                                waitingEntry.getId());
                        waitingEntry.setApproachingNotifiedAt(Instant.now());
                        queueEntryRepository.save(waitingEntry);
                    });
        }
    }

    private OpdQueueEntryEntity requireQueueEntry(UserPrincipal principal, UUID queueEntryId) {
        OpdQueueEntryEntity entry = queueEntryRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(queueEntryId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Queue entry not found"));
        opdAccessService.assertQueueEntryScope(principal, entry);
        return entry;
    }

    private EncounterEntity requireEncounter(UUID tenantId, UUID encounterId) {
        return encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
    }

    private OpdQueueEntryResponse toQueueResponse(UUID tenantId, OpdQueueEntryEntity entry) {
        EncounterEntity encounter = requireEncounter(tenantId, entry.getEncounterId());
        return toQueueResponse(tenantId, entry, encounter);
    }

    private Page<OpdQueueEntryResponse> toQueueResponsePage(UUID tenantId, Page<OpdQueueEntryEntity> page) {
        List<OpdQueueEntryEntity> content = page.getContent();
        if (content.isEmpty()) {
            return Page.empty(page.getPageable());
        }

        List<UUID> encounterIds = content.stream().map(OpdQueueEntryEntity::getEncounterId).toList();
        Map<UUID, EncounterEntity> encounters = encounterRepository
                .findAllById(encounterIds)
                .stream()
                .filter(e -> e.getTenantId().equals(tenantId) && e.getDeletedAt() == null)
                .collect(Collectors.toMap(EncounterEntity::getId, Function.identity()));

        List<UUID> patientIds = encounters.values().stream()
                .map(EncounterEntity::getPatientId)
                .distinct()
                .toList();
        Map<UUID, PatientProfileEntity> patients = patientProfileRepository
                .findByTenantIdAndIdIn(tenantId, patientIds)
                .stream()
                .collect(Collectors.toMap(PatientProfileEntity::getId, Function.identity()));

        Map<UUID, String> patientNames = patientDisplayNameResolver.resolveBatch(patients.values());

        Map<UUID, String> invoiceStatusByEncounter = invoiceRepository
                .findActiveByTenantAndEncounters(
                        tenantId, encounterIds, InvoiceStatus.CANCELLED.name())
                .stream()
                .collect(Collectors.toMap(
                        InvoiceEntity::getEncounterId,
                        InvoiceEntity::getStatus,
                        this::preferInvoiceStatus));

        List<OpdQueueEntryResponse> responses = content.stream()
                .map(entry -> {
                    EncounterEntity encounter = encounters.get(entry.getEncounterId());
                    if (encounter == null) {
                        throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                                "Encounter not found");
                    }
                    PatientProfileEntity patient = patients.get(encounter.getPatientId());
                    return toQueueResponse(
                            entry,
                            encounter,
                            patientNames.get(encounter.getPatientId()),
                            patient != null ? patient.getUhid() : null,
                            invoiceStatusByEncounter.get(entry.getEncounterId()));
                })
                .toList();

        return new PageImpl<>(responses, page.getPageable(), page.getTotalElements());
    }

    private OpdQueueEntryResponse toQueueResponse(
            UUID tenantId, OpdQueueEntryEntity entry, EncounterEntity encounter) {
        PatientProfileEntity patient = patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounter.getPatientId(), tenantId)
                .orElse(null);
        String invoiceStatus = invoiceRepository
                .findFirstByTenantIdAndEncounterIdAndDeletedAtIsNullAndStatusNotOrderByIssuedAtDesc(
                        tenantId, encounter.getId(), InvoiceStatus.CANCELLED.name())
                .map(InvoiceEntity::getStatus)
                .orElse(null);
        return toQueueResponse(
                entry,
                encounter,
                patientDisplayNameResolver.resolve(patient),
                patient != null ? patient.getUhid() : null,
                invoiceStatus);
    }

    private OpdQueueEntryResponse toQueueResponse(
            OpdQueueEntryEntity entry,
            EncounterEntity encounter,
            String patientName,
            String uhid,
            String invoiceStatus) {
        EncounterResponse encounterResponse = opdMapper.toEncounterResponse(encounter, patientName, uhid);
        return opdMapper.toQueueEntryResponse(
                entry, encounter, encounterResponse, patientName, uhid, invoiceStatus);
    }

    private String preferInvoiceStatus(String existing, String candidate) {
        return invoiceStatusRank(candidate) > invoiceStatusRank(existing) ? candidate : existing;
    }

    private int invoiceStatusRank(String status) {
        if (status == null) {
            return 0;
        }
        return switch (status) {
            case "PAID" -> 5;
            case "PARTIALLY_PAID" -> 4;
            case "ISSUED" -> 3;
            case "DRAFT" -> 2;
            default -> 1;
        };
    }

    private QueueEntryStatus parseQueueStatus(String raw) {
        try {
            return QueueEntryStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid queue status");
        }
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return parseQueueStatus(status).name();
    }

    private BusinessException invalidTransition(QueueEntryStatus from, QueueEntryStatus to) {
        return new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                "Cannot transition queue entry from " + from + " to " + to);
    }
}
