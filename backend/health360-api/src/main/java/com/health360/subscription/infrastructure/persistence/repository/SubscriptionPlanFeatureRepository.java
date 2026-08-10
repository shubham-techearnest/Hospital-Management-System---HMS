package com.health360.subscription.infrastructure.persistence.repository;

import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanFeatureEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPlanFeatureRepository extends JpaRepository<SubscriptionPlanFeatureEntity, UUID> {

    List<SubscriptionPlanFeatureEntity> findByPlanIdAndDeletedAtIsNull(UUID planId);

    Optional<SubscriptionPlanFeatureEntity> findByPlanIdAndFeatureKeyAndDeletedAtIsNull(UUID planId, String featureKey);
}
