package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.EncounterWellnessPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EncounterWellnessPlanRepository extends JpaRepository<EncounterWellnessPlanEntity, UUID> {

    Optional<EncounterWellnessPlanEntity> findByEncounterIdAndDeletedAtIsNull(UUID encounterId);
}
