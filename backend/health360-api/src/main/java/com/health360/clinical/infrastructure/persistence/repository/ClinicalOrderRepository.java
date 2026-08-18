package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClinicalOrderRepository extends JpaRepository<ClinicalOrderEntity, UUID> {

    Optional<ClinicalOrderEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<ClinicalOrderEntity> findByEncounterIdAndDeletedAtIsNullOrderByOrderedAtDesc(UUID encounterId);

    long countByEncounterIdAndDeletedAtIsNull(UUID encounterId);
}
