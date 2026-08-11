package com.health360.subscription.application.service;

import com.health360.subscription.application.dto.LimitCheckResult;
import com.health360.subscription.domain.PlanLimitKeys;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanLimitEntity;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanLimitRepository;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanRepository;
import com.health360.subscription.presentation.dto.response.HospitalSubscriptionResponse;
import com.health360.subscription.presentation.dto.response.UsageMetricResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalSubscriptionQueryService {

    private final HospitalSubscriptionService hospitalSubscriptionService;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanLimitRepository planLimitRepository;
    private final PlanLimitService planLimitService;
    private final FeatureAccessService featureAccessService;

    @Transactional(readOnly = true)
    public HospitalSubscriptionResponse getHospitalSubscriptionSummary(UUID hospitalId, UUID tenantId) {
        HospitalSubscriptionEntity subscription = hospitalSubscriptionService.requireActiveSubscription(hospitalId, tenantId);
        SubscriptionPlanEntity plan = planRepository.findById(subscription.getPlanId()).orElseThrow();

        LimitCheckResult doctors = planLimitService.getDoctorUsageWithLimit(hospitalId, tenantId);
        Map<String, UsageMetricResponse> usage = new LinkedHashMap<>();
        usage.put("doctors", toMetric(doctors));

        List<SubscriptionPlanLimitEntity> limits = planLimitRepository.findByPlanIdAndDeletedAtIsNull(plan.getId());
        for (SubscriptionPlanLimitEntity limit : limits) {
            if (PlanLimitKeys.MAX_DOCTORS.equals(limit.getLimitKey())) {
                continue;
            }
            long used = resolveUsage(hospitalId, limit.getLimitKey());
            usage.put(normalizeUsageKey(limit.getLimitKey()), UsageMetricResponse.builder()
                    .used(used)
                    .limit(limit.getLimitValue())
                    .remaining(Math.max(0, limit.getLimitValue() - used))
                    .build());
        }

        Map<String, Boolean> features = featureAccessService.getFeaturesForHospital(hospitalId, tenantId);

        return HospitalSubscriptionResponse.builder()
                .status(subscription.getStatus())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .autoRenew(subscription.isAutoRenew())
                .plan(HospitalSubscriptionResponse.PlanSummary.builder()
                        .id(plan.getId())
                        .code(plan.getCode())
                        .name(plan.getName())
                        .description(plan.getDescription())
                        .price(plan.getPrice())
                        .currency(plan.getCurrency())
                        .billingCycle(plan.getBillingCycle())
                        .build())
                .usage(usage)
                .features(features)
                .build();
    }

    private UsageMetricResponse toMetric(LimitCheckResult result) {
        return UsageMetricResponse.builder()
                .used(result.getUsed())
                .limit(result.getLimit())
                .remaining(result.getRemaining())
                .build();
    }

    private long resolveUsage(UUID hospitalId, String limitKey) {
        return planLimitService.resolveUsage(hospitalId, limitKey);
    }

    private String normalizeUsageKey(String limitKey) {
        return limitKey.toLowerCase().replace("max_", "");
    }
}
