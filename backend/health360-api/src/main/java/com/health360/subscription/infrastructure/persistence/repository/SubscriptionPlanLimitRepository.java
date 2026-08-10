package com.health360.subscription.infrastructure.persistence.repository;

import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanLimitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPlanLimitRepository extends JpaRepository<SubscriptionPlanLimitEntity, UUID> {

    List<SubscriptionPlanLimitEntity> findByPlanIdAndDeletedAtIsNull(UUID planId);

    Optional<SubscriptionPlanLimitEntity> findByPlanIdAndLimitKeyAndDeletedAtIsNull(UUID planId, String limitKey);
}
