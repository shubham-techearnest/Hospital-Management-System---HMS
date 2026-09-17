package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.ChargePostingEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChargePostingRepository extends JpaRepository<ChargePostingEntity, UUID> {

    boolean existsBySourceEventIdAndCatalogCodeAndDeletedAtIsNull(UUID sourceEventId, String catalogCode);

    Optional<ChargePostingEntity> findBySourceEventIdAndCatalogCodeAndDeletedAtIsNull(
            UUID sourceEventId, String catalogCode);

    Page<ChargePostingEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, Pageable pageable);

    List<ChargePostingEntity> findByTenantIdAndIdInAndDeletedAtIsNull(UUID tenantId, Collection<UUID> ids);
}
