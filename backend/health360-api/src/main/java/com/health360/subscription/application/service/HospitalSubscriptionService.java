package com.health360.subscription.application.service;

import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.domain.SubscriptionHistoryEventType;
import com.health360.subscription.domain.SubscriptionStatus;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionEntity;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionHistoryEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.health360.subscription.infrastructure.persistence.repository.HospitalSubscriptionHistoryRepository;
import com.health360.subscription.infrastructure.persistence.repository.HospitalSubscriptionRepository;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalSubscriptionService {

    private static final List<String> ACTIVE_STATUSES = List.of(
            SubscriptionStatus.ACTIVE.name(),
            SubscriptionStatus.TRIAL.name());

    public static final String DEFAULT_FREE_PLAN_CODE = "FREE";

    private final HospitalSubscriptionRepository subscriptionRepository;
    private final HospitalSubscriptionHistoryRepository historyRepository;
    private final SubscriptionPlanRepository planRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public HospitalSubscriptionEntity requireActiveSubscription(UUID hospitalId, UUID tenantId) {
        return subscriptionRepository
                .findByHospitalIdAndTenantIdAndStatusIn(hospitalId, tenantId, ACTIVE_STATUSES)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.SUBSCRIPTION_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "No active subscription found for this hospital"));
    }

    @Transactional(readOnly = true)
    public SubscriptionPlanEntity requirePlan(UUID planId, UUID tenantId) {
        SubscriptionPlanEntity plan = planRepository.findByIdAndTenantIdAndDeletedAtIsNull(planId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND, HttpStatus.NOT_FOUND, "Plan not found"));
        if (!"ACTIVE".equals(plan.getStatus())) {
            throw new BusinessException(ErrorCode.PLAN_INACTIVE, HttpStatus.BAD_REQUEST, "Plan is not active");
        }
        return plan;
    }

    @Transactional(readOnly = true)
    public SubscriptionPlanEntity requirePlanByCode(String code, UUID tenantId) {
        SubscriptionPlanEntity plan = planRepository.findByTenantIdAndCodeAndDeletedAtIsNull(tenantId, code)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND, HttpStatus.NOT_FOUND, "Plan not found"));
        if (!"ACTIVE".equals(plan.getStatus())) {
            throw new BusinessException(ErrorCode.PLAN_INACTIVE, HttpStatus.BAD_REQUEST, "Plan is not active");
        }
        return plan;
    }

    @Transactional
    public HospitalSubscriptionEntity assignInitialPlan(
            UUID hospitalId, UUID tenantId, String planCode, UUID actorId, String notes) {
        if (subscriptionRepository.findByHospitalIdAndStatusIn(hospitalId, ACTIVE_STATUSES).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Hospital already has an active subscription");
        }

        SubscriptionPlanEntity plan = requirePlanByCode(planCode, tenantId);

        HospitalSubscriptionEntity subscription = new HospitalSubscriptionEntity();
        subscription.setTenantId(tenantId);
        subscription.setHospitalId(hospitalId);
        subscription.setPlanId(plan.getId());
        subscription.setStatus(SubscriptionStatus.ACTIVE.name());
        subscription.setStartDate(LocalDate.now());
        subscription.setAutoRenew(true);
        subscription.setPriceAtSubscription(plan.getPrice());
        subscription.setCurrency(plan.getCurrency());
        subscription.setCreatedBy(actorId);
        subscription.setUpdatedBy(actorId);
        subscription = subscriptionRepository.save(subscription);

        recordHistory(subscription, null, SubscriptionHistoryEventType.INITIAL.name(), notes, actorId);

        auditLogService.record(tenantId, actorId, "HOSPITAL_SUBSCRIPTION_ASSIGNED", "HospitalSubscription",
                subscription.getId(), Map.of("planCode", plan.getCode(), "hospitalId", hospitalId));

        return subscription;
    }

    @Transactional
    public HospitalSubscriptionEntity changePlan(
            UUID hospitalId, UUID tenantId, String newPlanCode, UUID actorId, String notes) {
        HospitalSubscriptionEntity current = requireActiveSubscription(hospitalId, tenantId);
        SubscriptionPlanEntity newPlan = requirePlanByCode(newPlanCode, tenantId);
        UUID previousPlanId = current.getPlanId();

        if (previousPlanId.equals(newPlan.getId())) {
            return current;
        }

        current.setStatus(SubscriptionStatus.CANCELLED.name());
        current.setEndDate(LocalDate.now());
        current.setUpdatedBy(actorId);
        current.touch();
        subscriptionRepository.save(current);

        recordHistory(current, previousPlanId, SubscriptionHistoryEventType.PLAN_CHANGE.name(),
                "Previous subscription closed: " + notes, actorId);

        HospitalSubscriptionEntity next = new HospitalSubscriptionEntity();
        next.setTenantId(tenantId);
        next.setHospitalId(hospitalId);
        next.setPlanId(newPlan.getId());
        next.setStatus(SubscriptionStatus.ACTIVE.name());
        next.setStartDate(LocalDate.now());
        next.setAutoRenew(true);
        next.setPriceAtSubscription(newPlan.getPrice());
        next.setCurrency(newPlan.getCurrency());
        next.setCreatedBy(actorId);
        next.setUpdatedBy(actorId);
        next = subscriptionRepository.save(next);

        recordHistory(next, previousPlanId, SubscriptionHistoryEventType.UPGRADE.name(), notes, actorId);

        auditLogService.record(tenantId, actorId, "HOSPITAL_SUBSCRIPTION_PLAN_CHANGED", "HospitalSubscription",
                next.getId(), Map.of("previousPlanId", previousPlanId, "newPlanCode", newPlan.getCode()));

        return next;
    }

    private void recordHistory(
            HospitalSubscriptionEntity subscription,
            UUID previousPlanId,
            String eventType,
            String notes,
            UUID actorId) {
        HospitalSubscriptionHistoryEntity history = new HospitalSubscriptionHistoryEntity();
        history.setTenantId(subscription.getTenantId());
        history.setHospitalId(subscription.getHospitalId());
        history.setSubscriptionId(subscription.getId());
        history.setPlanId(subscription.getPlanId());
        history.setPreviousPlanId(previousPlanId);
        history.setEventType(eventType);
        history.setStatus(subscription.getStatus());
        history.setNotes(notes);
        history.setCreatedBy(actorId);
        historyRepository.save(history);
    }
}
