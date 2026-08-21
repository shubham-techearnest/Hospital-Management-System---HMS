package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalVitalSignEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClinicalVitalSignRepository extends JpaRepository<ClinicalVitalSignEntity, UUID> {

    List<ClinicalVitalSignEntity> findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(UUID encounterId);
}
