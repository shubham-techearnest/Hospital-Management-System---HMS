package com.health360.subscription.infrastructure.persistence.repository;

import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlanEntity, UUID> {

    Optional<SubscriptionPlanEntity> findByTenantIdAndCodeAndDeletedAtIsNull(UUID tenantId, String code);

    Optional<SubscriptionPlanEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    java.util.List<SubscriptionPlanEntity> findByTenantIdAndDeletedAtIsNullOrderByPriceAsc(UUID tenantId);
}
