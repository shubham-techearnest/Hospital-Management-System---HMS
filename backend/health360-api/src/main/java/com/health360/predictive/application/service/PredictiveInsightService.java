package com.health360.predictive.application.service;

import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.blood.infrastructure.persistence.repository.BloodRequestRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.emergency.infrastructure.persistence.repository.EdVisitRepository;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.inventory.infrastructure.persistence.repository.InventoryStockBalanceRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdBedRepository;
import com.health360.predictive.infrastructure.persistence.entity.PredictiveInsightEntity;
import com.health360.predictive.infrastructure.persistence.repository.PredictiveInsightRepository;
import com.health360.predictive.presentation.dto.response.PredictiveInsightResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.staffops.infrastructure.persistence.repository.StaffLeaveRequestRepository;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import com.health360.tasks.infrastructure.persistence.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PredictiveInsightService {

    private static final Set<String> OPEN_TASK_STATUSES = Set.of("PENDING", "ASSIGNED", "IN_PROGRESS", "BLOCKED");
    private static final Set<String> ED_ACTIVE = Set.of("ARRIVED", "TRIAGED", "IN_TREATMENT");
    private static final Set<String> BLOOD_OPEN = Set.of("REQUESTED", "APPROVED", "ISSUED");

    private final PredictiveInsightRepository insightRepository;
    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;
    private final IpdBedRepository bedRepository;
    private final EdVisitRepository edVisitRepository;
    private final WorkItemRepository workItemRepository;
    private final InventoryStockBalanceRepository stockBalanceRepository;
    private final StaffLeaveRequestRepository leaveRequestRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final EventPublisher eventPublisher;

    @Transactional
    public List<PredictiveInsightResponse> refresh(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        assertCanWrite(principal);
        assertModule(principal, hospitalId, branchId);
        return refreshInternal(principal.getTenantId(), hospitalId, branchId, principal.getUserId());
    }

    @Transactional
    public List<PredictiveInsightResponse> refreshInternal(
            UUID tenantId, UUID hospitalId, UUID branchId, UUID actorUserId) {
        Instant now = Instant.now();
        List<PredictiveInsightResponse> results = new ArrayList<>();

        long available = bedRepository.countByHospitalBranch(tenantId, hospitalId, branchId, "AVAILABLE");
        long occupied = bedRepository.countByHospitalBranch(tenantId, hospitalId, branchId, "OCCUPIED");
        long cleaning = bedRepository.countByHospitalBranch(tenantId, hospitalId, branchId, "CLEANING");
        long bedCapacity = available + occupied + cleaning;
        int bedOccPct = bedCapacity == 0 ? 0 : (int) Math.round(100.0 * (occupied + cleaning) / bedCapacity);
        results.add(upsert(tenantId, hospitalId, branchId, actorUserId, now,
                "BED_PRESSURE",
                bedOccPct >= 90 ? "CRITICAL" : bedOccPct >= 75 ? "WARN" : "INFO",
                bedOccPct,
                "Bed pressure " + bedOccPct + "%",
                "Occupancy pressure is " + bedOccPct + "% (" + occupied + " occupied, "
                        + cleaning + " cleaning, " + available + " available).",
                Map.of("occupied", occupied, "cleaning", cleaning, "available", available, "occupancyPct", bedOccPct)));

        long edActive = edVisitRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
                tenantId, hospitalId, branchId, ED_ACTIVE);
        int edScore = (int) Math.min(100, edActive * 10);
        results.add(upsert(tenantId, hospitalId, branchId, actorUserId, now,
                "ED_PRESSURE",
                edActive >= 10 ? "CRITICAL" : edActive >= 5 ? "WARN" : "INFO",
                edScore,
                "ED load " + edActive + " active",
                edActive + " active ED visits (arrived/triaged/in treatment).",
                Map.of("edActiveVisits", edActive)));

        Instant horizon = now.plus(2, ChronoUnit.HOURS);
        long dueSoon = workItemRepository.countDueSoonOpen(
                tenantId, hospitalId, OPEN_TASK_STATUSES, now, horizon);
        long overdue = workItemRepository.countOverdueOpen(
                tenantId, hospitalId, OPEN_TASK_STATUSES, now);
        int slaScore = (int) Math.min(100, overdue * 15 + dueSoon * 8);
        results.add(upsert(tenantId, hospitalId, branchId, actorUserId, now,
                "TASK_SLA_RISK",
                overdue >= 5 || dueSoon >= 10 ? "CRITICAL" : overdue >= 1 || dueSoon >= 3 ? "WARN" : "INFO",
                slaScore,
                "Task SLA risk",
                overdue + " overdue and " + dueSoon + " due within 2 hours.",
                Map.of("overdueTasks", overdue, "dueSoonTasks", dueSoon)));

        long lowStock = stockBalanceRepository
                .findBoard(tenantId, hospitalId, branchId, null, true, PageRequest.of(0, 1))
                .getTotalElements();
        int stockScore = (int) Math.min(100, lowStock * 12);
        results.add(upsert(tenantId, hospitalId, branchId, actorUserId, now,
                "STOCKOUT_RISK",
                lowStock >= 8 ? "CRITICAL" : lowStock >= 1 ? "WARN" : "INFO",
                stockScore,
                "Stockout risk",
                lowStock + " stock balance(s) at or below reorder level.",
                Map.of("lowStockItems", lowStock)));

        long leavePending = leaveRequestRepository
                .countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, hospitalId, branchId, "REQUESTED");
        long bloodOpen = bloodRequestRepository
                .countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
                        tenantId, hospitalId, branchId, BLOOD_OPEN);
        int leaveScore = (int) Math.min(100, leavePending * 20 + bloodOpen * 5);
        results.add(upsert(tenantId, hospitalId, branchId, actorUserId, now,
                "LEAVE_COVERAGE",
                leavePending >= 4 ? "CRITICAL" : leavePending >= 1 ? "WARN" : "INFO",
                leaveScore,
                "Coverage / leave pressure",
                leavePending + " pending leave request(s); " + bloodOpen + " open blood request(s).",
                Map.of("pendingLeave", leavePending, "openBloodRequests", bloodOpen)));

        return results;
    }

    @Transactional(readOnly = true)
    public List<PredictiveInsightResponse> listActive(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        assertCanRead(principal);
        assertModule(principal, hospitalId, branchId);
        return insightRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByScoreDescGeneratedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, "ACTIVE")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PredictiveInsightResponse acknowledge(UserPrincipal principal, UUID insightId) {
        assertCanWrite(principal);
        PredictiveInsightEntity entity = insightRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(insightId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Insight not found"));
        assertModule(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"ACTIVE".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only ACTIVE insights can be acknowledged");
        }
        entity.setStatus("ACKNOWLEDGED");
        entity.setAcknowledgedAt(Instant.now());
        entity.setAcknowledgedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        return toResponse(insightRepository.save(entity));
    }

    public long countActive(UUID tenantId, UUID hospitalId, UUID branchId) {
        return insightRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                tenantId, hospitalId, branchId, "ACTIVE");
    }

    public long countCritical(UUID tenantId, UUID hospitalId, UUID branchId) {
        return insightRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndSeverityAndDeletedAtIsNull(
                tenantId, hospitalId, branchId, "ACTIVE", "CRITICAL");
    }

    private PredictiveInsightResponse upsert(
            UUID tenantId,
            UUID hospitalId,
            UUID branchId,
            UUID actorUserId,
            Instant now,
            String type,
            String severity,
            int score,
            String title,
            String message,
            Map<String, Object> payload) {
        PredictiveInsightEntity entity = insightRepository
                .findByHospitalIdAndBranchIdAndInsightTypeAndStatusAndDeletedAtIsNull(
                        hospitalId, branchId, type, "ACTIVE")
                .orElseGet(PredictiveInsightEntity::new);

        boolean isNew = entity.getId() == null;
        String previousSeverity = entity.getSeverity();
        if (isNew) {
            entity.setTenantId(tenantId);
            entity.setHospitalId(hospitalId);
            entity.setBranchId(branchId);
            entity.setInsightType(type);
            entity.setStatus("ACTIVE");
            entity.setCreatedBy(actorUserId);
        }
        entity.setSeverity(severity);
        entity.setScore(score);
        entity.setTitle(title);
        entity.setMessage(message);
        entity.setPayload(new HashMap<>(payload));
        entity.setGeneratedAt(now);
        entity.setExpiresAt(now.plus(6, ChronoUnit.HOURS));
        entity.setUpdatedBy(actorUserId);
        PredictiveInsightEntity saved = insightRepository.save(entity);

        if ("CRITICAL".equals(severity) && (isNew || !"CRITICAL".equals(previousSeverity))) {
            Map<String, Object> eventPayload = new HashMap<>(payload);
            eventPayload.put("insightType", type);
            eventPayload.put("severity", severity);
            eventPayload.put("title", title);
            eventPublisher.publish(EventPublisher.PublishRequest.builder()
                    .tenantId(tenantId)
                    .hospitalId(hospitalId)
                    .branchId(branchId)
                    .userId(actorUserId)
                    .eventType(HospitalEventTypes.PREDICTIVE_INSIGHT_RAISED)
                    .entityType("PredictiveInsight")
                    .entityId(saved.getId())
                    .correlationId(saved.getId())
                    .sourceModule("PREDICTIVE")
                    .payload(eventPayload)
                    .build());
        }

        return toResponse(saved);
    }

    private void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("predictive:read") && !principal.hasPermission("commandcenter:read")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("predictive:write")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void assertModule(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId, branchId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_PREDICTIVE_OPS,
                "Predictive ops is not included in this hospital's subscription plan");
    }

    private PredictiveInsightResponse toResponse(PredictiveInsightEntity e) {
        return PredictiveInsightResponse.builder()
                .insightId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .insightType(e.getInsightType())
                .severity(e.getSeverity())
                .title(e.getTitle())
                .message(e.getMessage())
                .score(e.getScore())
                .status(e.getStatus())
                .payload(e.getPayload())
                .generatedAt(e.getGeneratedAt())
                .expiresAt(e.getExpiresAt())
                .build();
    }
}
