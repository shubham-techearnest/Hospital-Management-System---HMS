package com.health360.asset.application.service;

import com.health360.asset.domain.AssetStatus;
import com.health360.asset.infrastructure.persistence.entity.AssetEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceScheduleEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetMaintenanceTicketEntity;
import com.health360.asset.infrastructure.persistence.entity.AssetStatusHistoryEntity;
import com.health360.asset.infrastructure.persistence.repository.AssetCategoryRepository;
import com.health360.asset.infrastructure.persistence.repository.AssetMaintenanceScheduleRepository;
import com.health360.asset.infrastructure.persistence.repository.AssetMaintenanceTicketRepository;
import com.health360.asset.infrastructure.persistence.repository.AssetRepository;
import com.health360.asset.infrastructure.persistence.repository.AssetStatusHistoryRepository;
import com.health360.asset.presentation.dto.request.CompleteAssetTicketRequest;
import com.health360.asset.presentation.dto.request.CreateAssetScheduleRequest;
import com.health360.asset.presentation.dto.request.ReportAssetBreakdownRequest;
import com.health360.asset.presentation.dto.response.AssetMaintenanceScheduleResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceTicketResponse;
import com.health360.asset.presentation.dto.response.AssetResponse;
import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.tasks.application.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetEamService {

    private static final Set<String> OPEN_TICKET_STATUSES = Set.of("OPEN", "IN_PROGRESS");

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository categoryRepository;
    private final AssetStatusHistoryRepository statusHistoryRepository;
    private final AssetMaintenanceTicketRepository ticketRepository;
    private final AssetMaintenanceScheduleRepository scheduleRepository;
    private final AssetAccessService accessService;
    private final AssetMapper mapper;
    private final EventPublisher eventPublisher;
    private final TaskService taskService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public AssetResponse lookupByQr(UserPrincipal principal, UUID hospitalId, String qrOrTag) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId);
        String key = qrOrTag == null ? "" : qrOrTag.trim();
        if (key.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "qr payload required");
        }

        AssetEntity asset = assetRepository
                .findByTenantIdAndHospitalIdAndQrPayloadAndDeletedAtIsNull(principal.getTenantId(), hospitalId, key)
                .or(() -> {
                    // allow AST:<uuid> or bare asset tag lookup across branch via qr backfill / tag search
                    if (key.toUpperCase(Locale.ROOT).startsWith("AST:")) {
                        try {
                            UUID id = UUID.fromString(key.substring(4));
                            return assetRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, principal.getTenantId());
                        } catch (IllegalArgumentException ignored) {
                            return java.util.Optional.empty();
                        }
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Asset not found for QR/tag"));

        if (!asset.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Asset not found for QR/tag");
        }
        return mapper.toAssetResponse(asset, categoryRepository.findById(asset.getCategoryId()).orElse(null));
    }

    @Transactional
    public AssetResponse commission(UserPrincipal principal, UUID assetId) {
        accessService.assertCanWrite(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());

        AssetStatus status = AssetStatus.valueOf(asset.getStatus());
        if (status == AssetStatus.DISPOSED || status == AssetStatus.RETIRED) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Cannot commission retired/disposed assets");
        }

        String from = asset.getStatus();
        asset.setCommissionedAt(Instant.now());
        if (status == AssetStatus.UNDER_REPAIR || status == AssetStatus.MAINTENANCE) {
            // leave repair status; commissioning only stamps date when already operational-ish
        } else if (status != AssetStatus.IN_USE) {
            asset.setStatus(AssetStatus.AVAILABLE.name());
        }
        asset.setUpdatedBy(principal.getUserId());
        asset.touch();
        AssetEntity saved = assetRepository.save(asset);

        if (!from.equals(saved.getStatus())) {
            recordStatusHistory(principal, saved, from, saved.getStatus(), "Commissioned");
        }

        publish(principal, saved, HospitalEventTypes.ASSET_COMMISSIONED, Map.of(
                "assetTag", saved.getAssetTag(),
                "qrPayload", saved.getQrPayload() != null ? saved.getQrPayload() : ""));

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_COMMISSIONED",
                "Asset", saved.getId(), Map.of("assetTag", saved.getAssetTag()));

        return mapper.toAssetResponse(saved, categoryRepository.findById(saved.getCategoryId()).orElse(null));
    }

    @Transactional
    public AssetMaintenanceTicketResponse reportBreakdown(
            UserPrincipal principal, UUID assetId, ReportAssetBreakdownRequest request) {
        accessService.assertCanWriteTicket(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());

        AssetStatus status = AssetStatus.valueOf(asset.getStatus());
        if (status == AssetStatus.DISPOSED || status == AssetStatus.RETIRED) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Cannot report breakdown on retired/disposed assets");
        }
        if (ticketRepository.existsByAssetIdAndTicketTypeAndStatusInAndDeletedAtIsNull(
                assetId, "BREAKDOWN", List.copyOf(OPEN_TICKET_STATUSES))) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Open breakdown ticket already exists for this asset");
        }

        String from = asset.getStatus();
        asset.setStatus(AssetStatus.UNDER_REPAIR.name());
        asset.setUpdatedBy(principal.getUserId());
        asset.touch();
        assetRepository.save(asset);
        recordStatusHistory(principal, asset, from, AssetStatus.UNDER_REPAIR.name(), request.getDescription());

        AssetMaintenanceTicketEntity ticket = newTicket(
                principal, asset, "BREAKDOWN", null,
                "Breakdown: " + asset.getAssetTag(),
                request.getDescription(),
                normalizePriority(request.getPriority()));
        AssetMaintenanceTicketEntity saved = ticketRepository.save(ticket);

        Map<String, Object> payload = new HashMap<>();
        payload.put("assetTag", asset.getAssetTag());
        payload.put("ticketNumber", saved.getTicketNumber());
        payload.put("ticketId", saved.getId().toString());
        publish(principal, asset, HospitalEventTypes.ASSET_BROKEN, payload);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_BREAKDOWN_REPORTED",
                "AssetMaintenanceTicket", saved.getId(),
                Map.of("assetTag", asset.getAssetTag(), "ticketNumber", saved.getTicketNumber()));

        return mapper.toTicketResponse(saved);
    }

    @Transactional
    public AssetMaintenanceTicketResponse completeTicket(
            UserPrincipal principal, UUID ticketId, CompleteAssetTicketRequest request) {
        accessService.assertCanWriteTicket(principal);
        AssetMaintenanceTicketEntity ticket = ticketRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(ticketId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Maintenance ticket not found"));
        accessService.assertModuleEnabled(principal, ticket.getHospitalId());

        if ("COMPLETED".equals(ticket.getStatus()) || "CANCELLED".equals(ticket.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Ticket already closed");
        }

        ticket.setStatus("COMPLETED");
        ticket.setCompletedAt(Instant.now());
        ticket.setCompletedBy(principal.getUserId());
        ticket.setResolutionNotes(trimToNull(request != null ? request.getResolutionNotes() : null));
        ticket.setUpdatedBy(principal.getUserId());
        ticket.touch();
        AssetMaintenanceTicketEntity saved = ticketRepository.save(ticket);

        AssetEntity asset = requireAsset(principal.getTenantId(), ticket.getAssetId());
        boolean restore = request == null || request.getRestoreAvailable() == null || Boolean.TRUE.equals(request.getRestoreAvailable());
        if (restore && (AssetStatus.UNDER_REPAIR.name().equals(asset.getStatus())
                || AssetStatus.MAINTENANCE.name().equals(asset.getStatus()))) {
            String from = asset.getStatus();
            asset.setStatus(AssetStatus.AVAILABLE.name());
            asset.setUpdatedBy(principal.getUserId());
            asset.touch();
            assetRepository.save(asset);
            recordStatusHistory(principal, asset, from, AssetStatus.AVAILABLE.name(), "Ticket completed");
        }

        if (ticket.getScheduleId() != null) {
            scheduleRepository.findByIdAndTenantIdAndDeletedAtIsNull(ticket.getScheduleId(), principal.getTenantId())
                    .ifPresent(schedule -> {
                        Instant next = advanceDue(schedule);
                        schedule.setLastGeneratedAt(Instant.now());
                        schedule.setNextDueAt(next);
                        schedule.setUpdatedBy(principal.getUserId());
                        schedule.touch();
                        scheduleRepository.save(schedule);
                        if ("PREVENTIVE".equals(schedule.getScheduleType())) {
                            asset.setNextPmAt(next);
                        } else if ("CALIBRATION".equals(schedule.getScheduleType())) {
                            asset.setNextCalibrationAt(next);
                        }
                        asset.setUpdatedBy(principal.getUserId());
                        asset.touch();
                        assetRepository.save(asset);
                    });
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("ticketNumber", saved.getTicketNumber());
        payload.put("ticketType", saved.getTicketType());
        payload.put("assetTag", asset.getAssetTag());
        publish(principal, asset, HospitalEventTypes.MAINTENANCE_COMPLETED, payload);

        String taskType = "BREAKDOWN".equals(saved.getTicketType())
                ? TaskTypes.ASSET_BREAKDOWN_REPAIR
                : TaskTypes.ASSET_PM_DUE;
        taskService.completeOpenTasksForEntity(
                principal.getTenantId(), "AssetMaintenanceTicket", saved.getId(), taskType, principal.getUserId());
        // also close tasks keyed by asset entity id from event reactor
        taskService.completeOpenTasksForEntity(
                principal.getTenantId(), "Asset", asset.getId(), taskType, principal.getUserId());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_TICKET_COMPLETED",
                "AssetMaintenanceTicket", saved.getId(), Map.of("ticketNumber", saved.getTicketNumber()));

        return mapper.toTicketResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<AssetMaintenanceTicketResponse> listTickets(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId);
        Page<AssetMaintenanceTicketEntity> page = status != null && !status.isBlank()
                ? ticketRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByOpenedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable)
                : ticketRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByOpenedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(mapper::toTicketResponse);
    }

    @Transactional(readOnly = true)
    public List<AssetMaintenanceTicketResponse> listTicketsForAsset(UserPrincipal principal, UUID assetId) {
        accessService.assertCanRead(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());
        return ticketRepository
                .findByTenantIdAndAssetIdAndDeletedAtIsNullOrderByOpenedAtDesc(principal.getTenantId(), assetId)
                .stream()
                .map(mapper::toTicketResponse)
                .toList();
    }

    @Transactional
    public AssetMaintenanceScheduleResponse createSchedule(
            UserPrincipal principal, CreateAssetScheduleRequest request) {
        accessService.assertCanWriteMaintenance(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), request.getAssetId());
        accessService.assertModuleEnabled(principal, asset.getHospitalId());

        String scheduleType = request.getScheduleType().trim().toUpperCase(Locale.ROOT);
        String cadence = request.getCadence().trim().toUpperCase(Locale.ROOT);
        if (!Set.of("PREVENTIVE", "CALIBRATION", "INSPECTION").contains(scheduleType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid schedule type");
        }
        if (!Set.of("WEEKLY", "MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUAL", "CUSTOM_DAYS").contains(cadence)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid cadence");
        }
        if ("CUSTOM_DAYS".equals(cadence) && (request.getIntervalDays() == null || request.getIntervalDays() < 1)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "intervalDays required for CUSTOM_DAYS");
        }

        Instant nextDue = request.getNextDueAt() != null
                ? request.getNextDueAt()
                : Instant.now().plus(30, ChronoUnit.DAYS);

        AssetMaintenanceScheduleEntity schedule = new AssetMaintenanceScheduleEntity();
        schedule.setTenantId(principal.getTenantId());
        schedule.setHospitalId(asset.getHospitalId());
        schedule.setBranchId(asset.getBranchId());
        schedule.setAssetId(asset.getId());
        schedule.setScheduleType(scheduleType);
        schedule.setCadence(cadence);
        schedule.setIntervalDays(request.getIntervalDays());
        schedule.setNextDueAt(nextDue);
        schedule.setActive(true);
        schedule.setNotes(trimToNull(request.getNotes()));
        schedule.setCreatedBy(principal.getUserId());
        schedule.setUpdatedBy(principal.getUserId());
        AssetMaintenanceScheduleEntity saved = scheduleRepository.save(schedule);

        if ("PREVENTIVE".equals(scheduleType)) {
            asset.setNextPmAt(nextDue);
        } else if ("CALIBRATION".equals(scheduleType)) {
            asset.setNextCalibrationAt(nextDue);
        }
        asset.setUpdatedBy(principal.getUserId());
        asset.touch();
        assetRepository.save(asset);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ASSET_SCHEDULE_CREATED",
                "AssetMaintenanceSchedule", saved.getId(), Map.of("assetTag", asset.getAssetTag()));

        return mapper.toScheduleResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssetMaintenanceScheduleResponse> listSchedules(UserPrincipal principal, UUID assetId) {
        accessService.assertCanRead(principal);
        AssetEntity asset = requireAsset(principal.getTenantId(), assetId);
        accessService.assertModuleEnabled(principal, asset.getHospitalId());
        return scheduleRepository
                .findByTenantIdAndAssetIdAndDeletedAtIsNullOrderByNextDueAtAsc(principal.getTenantId(), assetId)
                .stream()
                .map(mapper::toScheduleResponse)
                .toList();
    }

    /**
     * Generate OPEN tickets for schedules due now (or overdue). Idempotent per open ticket+schedule.
     */
    @Transactional
    public List<AssetMaintenanceTicketResponse> generateDueTickets(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanWriteMaintenance(principal);
        accessService.assertModuleEnabled(principal, hospitalId);

        Instant now = Instant.now();
        List<AssetMaintenanceScheduleEntity> due = scheduleRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndActiveTrueAndDeletedAtIsNullAndNextDueAtLessThanEqualOrderByNextDueAtAsc(
                        principal.getTenantId(), hospitalId, branchId, now);

        List<AssetMaintenanceTicketResponse> created = new java.util.ArrayList<>();
        for (AssetMaintenanceScheduleEntity schedule : due) {
            boolean openExists = ticketRepository
                    .findByTenantIdAndAssetIdAndDeletedAtIsNullOrderByOpenedAtDesc(
                            principal.getTenantId(), schedule.getAssetId())
                    .stream()
                    .anyMatch(t -> schedule.getId().equals(t.getScheduleId())
                            && OPEN_TICKET_STATUSES.contains(t.getStatus()));
            if (openExists) {
                continue;
            }

            AssetEntity asset = requireAsset(principal.getTenantId(), schedule.getAssetId());
            String title = schedule.getScheduleType() + " due: " + asset.getAssetTag();
            AssetMaintenanceTicketEntity ticket = newTicket(
                    principal, asset, schedule.getScheduleType(), schedule.getId(),
                    title, "Scheduled " + schedule.getCadence().toLowerCase(Locale.ROOT) + " maintenance",
                    "HIGH");
            AssetMaintenanceTicketEntity saved = ticketRepository.save(ticket);

            if (!AssetStatus.UNDER_REPAIR.name().equals(asset.getStatus())
                    && !AssetStatus.DISPOSED.name().equals(asset.getStatus())) {
                String from = asset.getStatus();
                asset.setStatus(AssetStatus.MAINTENANCE.name());
                asset.setUpdatedBy(principal.getUserId());
                asset.touch();
                assetRepository.save(asset);
                recordStatusHistory(principal, asset, from, AssetStatus.MAINTENANCE.name(), "PM due");
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("assetTag", asset.getAssetTag());
            payload.put("ticketNumber", saved.getTicketNumber());
            payload.put("scheduleId", schedule.getId().toString());
            payload.put("scheduleType", schedule.getScheduleType());
            publish(principal, asset, HospitalEventTypes.MAINTENANCE_DUE, payload);

            created.add(mapper.toTicketResponse(saved));
        }
        return created;
    }

    void recordStatusHistory(
            UserPrincipal principal, AssetEntity asset, String from, String to, String reason) {
        AssetStatusHistoryEntity history = new AssetStatusHistoryEntity();
        history.setTenantId(principal.getTenantId());
        history.setAssetId(asset.getId());
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setReason(trimToNull(reason));
        history.setChangedBy(principal.getUserId());
        history.setChangedAt(Instant.now());
        history.setCreatedBy(principal.getUserId());
        history.setUpdatedBy(principal.getUserId());
        statusHistoryRepository.save(history);
    }

    private AssetMaintenanceTicketEntity newTicket(
            UserPrincipal principal,
            AssetEntity asset,
            String ticketType,
            UUID scheduleId,
            String title,
            String description,
            String priority) {
        AssetMaintenanceTicketEntity ticket = new AssetMaintenanceTicketEntity();
        ticket.setTenantId(principal.getTenantId());
        ticket.setHospitalId(asset.getHospitalId());
        ticket.setBranchId(asset.getBranchId());
        ticket.setAssetId(asset.getId());
        ticket.setScheduleId(scheduleId);
        ticket.setTicketNumber(allocateTicketNumber());
        ticket.setTicketType(ticketType);
        ticket.setStatus("OPEN");
        ticket.setPriority(priority);
        ticket.setTitle(title);
        ticket.setDescription(trimToNull(description));
        ticket.setReportedBy(principal.getUserId());
        ticket.setAssignedRole("ASSET_MANAGER");
        ticket.setOpenedAt(Instant.now());
        ticket.setCreatedBy(principal.getUserId());
        ticket.setUpdatedBy(principal.getUserId());
        return ticket;
    }

    private void publish(UserPrincipal principal, AssetEntity asset, String eventType, Map<String, Object> payload) {
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(asset.getHospitalId())
                .branchId(asset.getBranchId())
                .eventType(eventType)
                .userId(principal.getUserId())
                .entityType("Asset")
                .entityId(asset.getId())
                .correlationId(asset.getId())
                .sourceModule("ASSET")
                .payload(payload)
                .build());
    }

    private Instant advanceDue(AssetMaintenanceScheduleEntity schedule) {
        Instant base = schedule.getNextDueAt() != null ? schedule.getNextDueAt() : Instant.now();
        return switch (schedule.getCadence()) {
            case "WEEKLY" -> base.plus(7, ChronoUnit.DAYS);
            case "MONTHLY" -> base.plus(30, ChronoUnit.DAYS);
            case "QUARTERLY" -> base.plus(90, ChronoUnit.DAYS);
            case "HALF_YEARLY" -> base.plus(182, ChronoUnit.DAYS);
            case "ANNUAL" -> base.plus(365, ChronoUnit.DAYS);
            case "CUSTOM_DAYS" -> base.plus(
                    schedule.getIntervalDays() != null ? schedule.getIntervalDays() : 30, ChronoUnit.DAYS);
            default -> base.plus(30, ChronoUnit.DAYS);
        };
    }

    private AssetEntity requireAsset(UUID tenantId, UUID assetId) {
        return assetRepository.findByIdAndTenantIdAndDeletedAtIsNull(assetId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Asset not found"));
    }

    private static String allocateTicketNumber() {
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return "TKT-" + year + "-" + suffix;
    }

    private static String normalizePriority(String raw) {
        if (raw == null || raw.isBlank()) {
            return "URGENT";
        }
        String p = raw.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("LOW", "NORMAL", "HIGH", "URGENT").contains(p)) {
            return "URGENT";
        }
        return p;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
