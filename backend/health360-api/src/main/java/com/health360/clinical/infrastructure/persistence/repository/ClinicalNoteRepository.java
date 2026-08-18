package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalNoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClinicalNoteRepository extends JpaRepository<ClinicalNoteEntity, UUID> {

    List<ClinicalNoteEntity> findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(UUID encounterId);
}
