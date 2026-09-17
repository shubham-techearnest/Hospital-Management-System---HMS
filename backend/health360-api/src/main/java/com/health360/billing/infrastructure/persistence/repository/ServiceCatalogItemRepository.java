package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.ServiceCatalogItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceCatalogItemRepository extends JpaRepository<ServiceCatalogItemEntity, UUID> {

    List<ServiceCatalogItemEntity> findByTenantIdAndTriggerEventTypeAndActiveTrueAndDeletedAtIsNull(
            UUID tenantId, String triggerEventType);

    Optional<ServiceCatalogItemEntity> findByTenantIdAndCodeAndDeletedAtIsNull(UUID tenantId, String code);
}
