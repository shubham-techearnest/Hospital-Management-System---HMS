package com.health360.facility.application.service;

import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.automation.infrastructure.persistence.entity.HospitalEventEntity;
import com.health360.config.security.UserPrincipal;
import com.health360.facility.infrastructure.persistence.entity.FacilityWorkOrderEntity;
import com.health360.facility.infrastructure.persistence.repository.FacilityWorkOrderRepository;
import com.health360.facility.presentation.dto.request.CompleteFacilityWorkOrderRequest;
import com.health360.facility.presentation.dto.request.CreateFacilityWorkOrderRequest;
import com.health360.facility.presentation.dto.response.FacilityWorkOrderResponse;
import com.health360.ipd.application.service.IpdFacilityService;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.tasks.application.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacilityWorkOrderService {

    private static final Set<String> WORK_TYPES = Set.of("HOUSEKEEPING", "LAUNDRY", "DIETARY", "TRANSPORT");
    private static final Set<String> OPEN_STATUSES = Set.of("OPEN", "IN_PROGRESS");

    private final FacilityWorkOrderRepository workOrderRepository;
    private final FacilityAccessService accessService;
    private final IpdFacilityService ipdFacilityService;
    private final EventPublisher eventPublisher;
    private final TaskService taskService;
    private final AuditLogService auditLogService;

    @Transactional
    public FacilityWorkOrderResponse create(UserPrincipal principal, CreateFacilityWorkOrderRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        String workType = normalizeWorkType(request.getWorkType());
        FacilityWorkOrderEntity entity = buildNew(
                principal.getTenantId(),
                request.getHospitalId(),
                request.getBranchId(),
                workType,
                request.getTitle().trim(),
                trimToNull(request.getDescription()),
                normalizePriority(request.getPriority(), defaultPriority(workType)),
                trimToNull(request.getLocationLabel()),
                request.getBedId(),
                request.getPatientId(),
                request.getEncounterId(),
                request.getAdmissionId(),
                request.getRequestedForAt(),
                null,
                null,
                principal.getUserId());

        FacilityWorkOrderEntity saved = workOrderRepository.save(entity);
        publishCreated(principal.getTenantId(), principal.getUserId(), saved, eventTypeFor(workType));
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "FACILITY_WORK_CREATED",
                "FacilityWorkOrder", saved.getId(),
                Map.of("workNumber", saved.getWorkNumber(), "workType", saved.getWorkType()));
        return toResponse(saved);
    }

    /**
     * Auto-create housekeeping work order from BED_RELEASED / transfer events (idempotent per bed).
     */
    @Transactional
    public void onHospitalEvent(HospitalEventEntity event) {
        if (event == null || event.getEventType() == null) {
            return;
        }
        if (!HospitalEventTypes.BED_RELEASED.equals(event.getEventType())
                && !HospitalEventTypes.PATIENT_TRANSFERRED.equals(event.getEventType())
                && !HospitalEventTypes.PATIENT_DISCHARGED.equals(event.getEventType())) {
            return;
        }

        UUID bedId = extractUuid(event.getPayload(), "bedId");
        if (bedId == null) {
            bedId = extractUuid(event.getPayload(), "fromBedId");
        }
        if (bedId == null) {
            return;
        }

        if (workOrderRepository.existsByBedIdAndWorkTypeAndStatusInAndDeletedAtIsNull(
                bedId, "HOUSEKEEPING", List.copyOf(OPEN_STATUSES))) {
            return;
        }

        Object bedCode = event.getPayload() != null ? event.getPayload().get("bedCode") : null;
        String location = bedCode != null ? String.valueOf(bedCode) : ("Bed " + bedId);
        String title = "Clean bed after turnaround";
        if (bedCode != null) {
            title = "Clean bed " + bedCode;
        }

        FacilityWorkOrderEntity entity = buildNew(
                event.getTenantId(),
                event.getHospitalId(),
                event.getBranchId(),
                "HOUSEKEEPING",
                title,
                "Auto-created from " + event.getEventType(),
                "HIGH",
                location,
                bedId,
                event.getPatientId(),
                event.getEncounterId(),
                extractUuid(event.getPayload(), "admissionId"),
                null,
                event.getEventType(),
                event.getId(),
                event.getUserId());

        FacilityWorkOrderEntity saved = workOrderRepository.save(entity);
        Map<String, Object> payload = new HashMap<>();
        payload.put("workNumber", saved.getWorkNumber());
        payload.put("workType", saved.getWorkType());
        payload.put("bedId", bedId.toString());
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(event.getTenantId())
                .hospitalId(event.getHospitalId())
                .branchId(event.getBranchId())
                .eventType(HospitalEventTypes.FACILITY_WORK_CREATED)
                .patientId(event.getPatientId())
                .encounterId(event.getEncounterId())
                .userId(event.getUserId())
                .entityType("FacilityWorkOrder")
                .entityId(saved.getId())
                .correlationId(bedId)
                .sourceModule("FACILITY")
                .payload(payload)
                .build());
        log.info("Created facility HK work order {} for bed {}", saved.getWorkNumber(), bedId);
    }

    @Transactional(readOnly = true)
    public Page<FacilityWorkOrderResponse> list(
            UserPrincipal principal,
            UUID hospitalId,
            UUID branchId,
            String workType,
            String status,
            Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);

        String typeFilter = workType != null && !workType.isBlank()
                ? workType.trim().toUpperCase(Locale.ROOT) : null;
        String statusFilter = status != null && !status.isBlank()
                ? status.trim().toUpperCase(Locale.ROOT) : null;

        Page<FacilityWorkOrderEntity> page;
        if (typeFilter != null && statusFilter != null) {
            page = workOrderRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndWorkTypeAndStatusAndDeletedAtIsNullOrderByOpenedAtDesc(
                            principal.getTenantId(), hospitalId, branchId, typeFilter, statusFilter, pageable);
        } else if (typeFilter != null) {
            page = workOrderRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndWorkTypeAndDeletedAtIsNullOrderByOpenedAtDesc(
                            principal.getTenantId(), hospitalId, branchId, typeFilter, pageable);
        } else if (statusFilter != null) {
            page = workOrderRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByOpenedAtDesc(
                            principal.getTenantId(), hospitalId, branchId, statusFilter, pageable);
        } else {
            page = workOrderRepository
                    .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByOpenedAtDesc(
                            principal.getTenantId(), hospitalId, branchId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public FacilityWorkOrderResponse get(UserPrincipal principal, UUID workOrderId) {
        accessService.assertCanRead(principal);
        FacilityWorkOrderEntity entity = require(principal.getTenantId(), workOrderId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        return toResponse(entity);
    }

    @Transactional
    public FacilityWorkOrderResponse start(UserPrincipal principal, UUID workOrderId) {
        accessService.assertCanComplete(principal);
        FacilityWorkOrderEntity entity = require(principal.getTenantId(), workOrderId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"OPEN".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only OPEN work orders can be started");
        }
        entity.setStatus("IN_PROGRESS");
        entity.setStartedAt(Instant.now());
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        return toResponse(workOrderRepository.save(entity));
    }

    @Transactional
    public FacilityWorkOrderResponse complete(
            UserPrincipal principal, UUID workOrderId, CompleteFacilityWorkOrderRequest request) {
        accessService.assertCanComplete(principal);
        FacilityWorkOrderEntity entity = require(principal.getTenantId(), workOrderId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());

        if ("COMPLETED".equals(entity.getStatus()) || "CANCELLED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Work order already closed");
        }

        entity.setStatus("COMPLETED");
        entity.setCompletedAt(Instant.now());
        entity.setCompletedBy(principal.getUserId());
        entity.setResolutionNotes(trimToNull(request != null ? request.getResolutionNotes() : null));
        if (entity.getStartedAt() == null) {
            entity.setStartedAt(entity.getCompletedAt());
        }
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        FacilityWorkOrderEntity saved = workOrderRepository.save(entity);

        boolean markBed = request == null
                || request.getMarkBedAvailable() == null
                || Boolean.TRUE.equals(request.getMarkBedAvailable());
        if (markBed && "HOUSEKEEPING".equals(saved.getWorkType()) && saved.getBedId() != null) {
            try {
                ipdFacilityService.markCleanedAvailable(
                        principal.getTenantId(), saved.getBedId(), principal.getUserId());
            } catch (BusinessException ex) {
                log.warn("Could not mark bed {} available after HK {}: {}",
                        saved.getBedId(), saved.getWorkNumber(), ex.getMessage());
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("workNumber", saved.getWorkNumber());
        payload.put("workType", saved.getWorkType());
        if (saved.getBedId() != null) {
            payload.put("bedId", saved.getBedId().toString());
        }
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.FACILITY_WORK_COMPLETED)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .entityType("FacilityWorkOrder")
                .entityId(saved.getId())
                .correlationId(saved.getBedId() != null ? saved.getBedId() : saved.getId())
                .sourceModule("FACILITY")
                .payload(payload)
                .build());

        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "FacilityWorkOrder",
                saved.getId(),
                taskTypeFor(saved.getWorkType()),
                principal.getUserId());
        if (saved.getBedId() != null && "HOUSEKEEPING".equals(saved.getWorkType())) {
            taskService.completeOpenTasksForEntity(
                    principal.getTenantId(),
                    "IpdBed",
                    saved.getBedId(),
                    TaskTypes.HOUSEKEEPING_BED_CLEAN,
                    principal.getUserId());
        }

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "FACILITY_WORK_COMPLETED",
                "FacilityWorkOrder", saved.getId(), Map.of("workNumber", saved.getWorkNumber()));

        return toResponse(saved);
    }

    private void publishCreated(UUID tenantId, UUID userId, FacilityWorkOrderEntity saved, String eventType) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("workNumber", saved.getWorkNumber());
        payload.put("workType", saved.getWorkType());
        payload.put("title", saved.getTitle());
        if (saved.getBedId() != null) {
            payload.put("bedId", saved.getBedId().toString());
        }
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(tenantId)
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(eventType)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(userId)
                .entityType("FacilityWorkOrder")
                .entityId(saved.getId())
                .correlationId(saved.getId())
                .sourceModule("FACILITY")
                .payload(payload)
                .build());
        if (!HospitalEventTypes.FACILITY_WORK_CREATED.equals(eventType)) {
            eventPublisher.publish(EventPublisher.PublishRequest.builder()
                    .tenantId(tenantId)
                    .hospitalId(saved.getHospitalId())
                    .branchId(saved.getBranchId())
                    .eventType(HospitalEventTypes.FACILITY_WORK_CREATED)
                    .patientId(saved.getPatientId())
                    .encounterId(saved.getEncounterId())
                    .userId(userId)
                    .entityType("FacilityWorkOrder")
                    .entityId(saved.getId())
                    .correlationId(saved.getId())
                    .sourceModule("FACILITY")
                    .payload(payload)
                    .build());
        }
    }

    private FacilityWorkOrderEntity buildNew(
            UUID tenantId,
            UUID hospitalId,
            UUID branchId,
            String workType,
            String title,
            String description,
            String priority,
            String locationLabel,
            UUID bedId,
            UUID patientId,
            UUID encounterId,
            UUID admissionId,
            Instant requestedForAt,
            String sourceEventType,
            UUID sourceEventId,
            UUID actorUserId) {
        FacilityWorkOrderEntity entity = new FacilityWorkOrderEntity();
        entity.setTenantId(tenantId);
        entity.setHospitalId(hospitalId);
        entity.setBranchId(branchId);
        entity.setWorkNumber(allocateNumber(workType));
        entity.setWorkType(workType);
        entity.setStatus("OPEN");
        entity.setPriority(priority);
        entity.setTitle(title);
        entity.setDescription(description);
        entity.setLocationLabel(locationLabel);
        entity.setBedId(bedId);
        entity.setPatientId(patientId);
        entity.setEncounterId(encounterId);
        entity.setAdmissionId(admissionId);
        entity.setRequestedForAt(requestedForAt);
        entity.setOpenedAt(Instant.now());
        entity.setSourceEventType(sourceEventType);
        entity.setSourceEventId(sourceEventId);
        entity.setCreatedBy(actorUserId);
        entity.setUpdatedBy(actorUserId);
        return entity;
    }

    private FacilityWorkOrderEntity require(UUID tenantId, UUID id) {
        return workOrderRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Facility work order not found"));
    }

    private FacilityWorkOrderResponse toResponse(FacilityWorkOrderEntity e) {
        return FacilityWorkOrderResponse.builder()
                .workOrderId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .workNumber(e.getWorkNumber())
                .workType(e.getWorkType())
                .status(e.getStatus())
                .priority(e.getPriority())
                .title(e.getTitle())
                .description(e.getDescription())
                .locationLabel(e.getLocationLabel())
                .bedId(e.getBedId())
                .patientId(e.getPatientId())
                .encounterId(e.getEncounterId())
                .admissionId(e.getAdmissionId())
                .requestedForAt(e.getRequestedForAt())
                .openedAt(e.getOpenedAt())
                .startedAt(e.getStartedAt())
                .completedAt(e.getCompletedAt())
                .completedBy(e.getCompletedBy())
                .resolutionNotes(e.getResolutionNotes())
                .sourceEventType(e.getSourceEventType())
                .build();
    }

    private static String normalizeWorkType(String raw) {
        String type = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        if (!WORK_TYPES.contains(type)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "workType must be one of " + WORK_TYPES);
        }
        return type;
    }

    private static String eventTypeFor(String workType) {
        return switch (workType) {
            case "DIETARY" -> HospitalEventTypes.DIET_ORDERED;
            case "LAUNDRY" -> HospitalEventTypes.LINEN_COLLECTED;
            case "TRANSPORT" -> HospitalEventTypes.TRANSPORT_REQUESTED;
            default -> HospitalEventTypes.FACILITY_WORK_CREATED;
        };
    }

    private static String taskTypeFor(String workType) {
        return switch (workType) {
            case "DIETARY" -> TaskTypes.FACILITY_DIETARY;
            case "LAUNDRY" -> TaskTypes.FACILITY_LAUNDRY;
            case "TRANSPORT" -> TaskTypes.FACILITY_TRANSPORT;
            default -> TaskTypes.FACILITY_HOUSEKEEPING;
        };
    }

    private static String defaultPriority(String workType) {
        return "HOUSEKEEPING".equals(workType) || "TRANSPORT".equals(workType) ? "HIGH" : "NORMAL";
    }

    private static String normalizePriority(String raw, String fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        String p = raw.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("LOW", "NORMAL", "HIGH", "URGENT").contains(p)) {
            return fallback;
        }
        return p;
    }

    private static String allocateNumber(String workType) {
        String prefix = switch (workType) {
            case "LAUNDRY" -> "LY";
            case "DIETARY" -> "DT";
            case "TRANSPORT" -> "TR";
            default -> "HK";
        };
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return prefix + "-" + year + "-" + suffix;
    }

    private static UUID extractUuid(Map<String, Object> payload, String key) {
        if (payload == null || !payload.containsKey(key) || payload.get(key) == null) {
            return null;
        }
        try {
            return UUID.fromString(String.valueOf(payload.get(key)));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
