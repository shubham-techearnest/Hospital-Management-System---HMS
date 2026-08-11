package com.health360.subscription.application.service;

import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanFeatureEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanLimitEntity;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanFeatureRepository;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanLimitRepository;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanRepository;
import com.health360.subscription.presentation.dto.request.UpdatePlanLimitsRequest;
import com.health360.subscription.presentation.dto.request.UpdateSubscriptionPlanRequest;
import com.health360.subscription.presentation.dto.response.SubscriptionPlanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminSubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanLimitRepository limitRepository;
    private final SubscriptionPlanFeatureRepository featureRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> listPlans(UUID tenantId) {
        return planRepository.findByTenantIdAndDeletedAtIsNullOrderByPriceAsc(tenantId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubscriptionPlanResponse getPlan(UUID tenantId, UUID planId) {
        return toResponse(requirePlan(tenantId, planId));
    }

    @Transactional
    public SubscriptionPlanResponse updatePlan(
            UUID tenantId, UUID actorId, UUID planId, UpdateSubscriptionPlanRequest request) {
        SubscriptionPlanEntity plan = requirePlan(tenantId, planId);

        if (request.getName() != null && !request.getName().isBlank()) {
            plan.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            plan.setDescription(request.getDescription().trim());
        }
        if (request.getPrice() != null) {
            plan.setPrice(request.getPrice());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            plan.setStatus(request.getStatus().trim().toUpperCase());
        }
        plan.setUpdatedBy(actorId);
        plan.touch();
        planRepository.save(plan);

        auditLogService.record(tenantId, actorId, "SUBSCRIPTION_PLAN_UPDATED", "SubscriptionPlan", planId,
                Map.of("code", plan.getCode(), "status", plan.getStatus()));

        return toResponse(plan);
    }

    @Transactional
    public SubscriptionPlanResponse updatePlanLimits(
            UUID tenantId, UUID actorId, UUID planId, UpdatePlanLimitsRequest request) {
        SubscriptionPlanEntity plan = requirePlan(tenantId, planId);

        for (UpdatePlanLimitsRequest.PlanLimitItem item : request.getLimits()) {
            SubscriptionPlanLimitEntity limit = limitRepository
                    .findByPlanIdAndLimitKeyAndDeletedAtIsNull(planId, item.getLimitKey().trim())
                    .orElseThrow(() -> new BusinessException(
                            ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Limit not found: " + item.getLimitKey()));
            limit.setLimitValue(item.getLimitValue());
            limit.setUpdatedBy(actorId);
            limit.touch();
            limitRepository.save(limit);
        }

        auditLogService.record(tenantId, actorId, "SUBSCRIPTION_PLAN_LIMITS_UPDATED", "SubscriptionPlan", planId,
                Map.of("code", plan.getCode(), "limitCount", request.getLimits().size()));

        return toResponse(plan);
    }

    private SubscriptionPlanEntity requirePlan(UUID tenantId, UUID planId) {
        return planRepository.findByIdAndTenantIdAndDeletedAtIsNull(planId, tenantId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.PLAN_NOT_FOUND, HttpStatus.NOT_FOUND, "Plan not found"));
    }

    private SubscriptionPlanResponse toResponse(SubscriptionPlanEntity plan) {
        List<SubscriptionPlanLimitEntity> limits =
                limitRepository.findByPlanIdAndDeletedAtIsNull(plan.getId());
        List<SubscriptionPlanFeatureEntity> features =
                featureRepository.findByPlanIdAndDeletedAtIsNull(plan.getId());

        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .code(plan.getCode())
                .name(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .currency(plan.getCurrency())
                .billingCycle(plan.getBillingCycle())
                .status(plan.getStatus())
                .trialDays(plan.getTrialDays())
                .limits(limits.stream()
                        .map(l -> SubscriptionPlanResponse.PlanLimitResponse.builder()
                                .limitKey(l.getLimitKey())
                                .limitValue(l.getLimitValue())
                                .build())
                        .toList())
                .features(features.stream()
                        .map(f -> SubscriptionPlanResponse.PlanFeatureResponse.builder()
                                .featureKey(f.getFeatureKey())
                                .enabled(f.isEnabled())
                                .build())
                        .toList())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
