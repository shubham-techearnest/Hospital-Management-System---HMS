package com.health360.subscription.application.service;

import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanFeatureEntity;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanFeatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeatureAccessService {

    private final HospitalSubscriptionService hospitalSubscriptionService;
    private final SubscriptionPlanFeatureRepository featureRepository;

    @Transactional(readOnly = true)
    public boolean hasFeature(UUID hospitalId, UUID tenantId, String featureKey) {
        var subscription = hospitalSubscriptionService.requireActiveSubscription(hospitalId, tenantId);
        return featureRepository.findByPlanIdAndFeatureKeyAndDeletedAtIsNull(subscription.getPlanId(), featureKey)
                .map(SubscriptionPlanFeatureEntity::isEnabled)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public Map<String, Boolean> getFeaturesForHospital(UUID hospitalId, UUID tenantId) {
        var subscription = hospitalSubscriptionService.requireActiveSubscription(hospitalId, tenantId);
        List<SubscriptionPlanFeatureEntity> features =
                featureRepository.findByPlanIdAndDeletedAtIsNull(subscription.getPlanId());
        Map<String, Boolean> result = new LinkedHashMap<>();
        for (SubscriptionPlanFeatureEntity feature : features) {
            result.put(feature.getFeatureKey(), feature.isEnabled());
        }
        return result;
    }
}
