package com.health360.opd.application.service;

import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.UpdateEncounterStatusRequest;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.opd.domain.QueueEntryStatus;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.opd.presentation.dto.request.OpdQueueActionRequest;
import com.health360.opd.presentation.dto.response.OpdQueueEntryResponse;
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpdQueueService {

    private final OpdQueueEntryRepository queueEntryRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterService encounterService;
    private final OpdDeskService deskService;
    private final OpdAccessService opdAccessService;
    private final OpdMapper opdMapper;
    private final AuditLogService auditLogService;

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
        opdAccessService.assertHospitalScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        LocalDate effectiveDate = queueDate != null ? queueDate : LocalDate.now(ZoneId.systemDefault());
        String normalizedStatus = normalizeStatus(status);

        return queueEntryRepository.findQueuePage(
                        tenantId, hospitalId, branchId, effectiveDate, normalizedStatus, deskId, pageable)
                .map(entry -> toQueueResponse(tenantId, entry));
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
        if (encounterTarget != null) {
            UpdateEncounterStatusRequest statusRequest = new UpdateEncounterStatusRequest();
            statusRequest.setStatus(encounterTarget.name());
            EncounterResponse updated = encounterService.updateEncounterStatus(
                    principal, encounter.getId(), statusRequest);
            encounter = requireEncounter(principal.getTenantId(), entry.getEncounterId());
            auditLogService.record(principal.getTenantId(), principal.getUserId(),
                    "OPD_QUEUE_" + targetStatus.name(), "OpdQueueEntry", entry.getId(),
                    Map.of("encounterStatus", updated.getStatus()));
            return toQueueResponse(principal.getTenantId(), entry, encounter, updated);
        }

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "OPD_QUEUE_" + targetStatus.name(), "OpdQueueEntry", entry.getId(), Map.of());

        return toQueueResponse(principal.getTenantId(), entry, encounter);
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

    private OpdQueueEntryResponse toQueueResponse(
            UUID tenantId, OpdQueueEntryEntity entry, EncounterEntity encounter) {
        EncounterResponse encounterResponse = opdMapper.toEncounterResponse(encounter);
        return opdMapper.toQueueEntryResponse(entry, encounter, encounterResponse);
    }

    private OpdQueueEntryResponse toQueueResponse(
            UUID tenantId,
            OpdQueueEntryEntity entry,
            EncounterEntity encounter,
            EncounterResponse encounterResponse) {
        return opdMapper.toQueueEntryResponse(entry, encounter, encounterResponse);
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
