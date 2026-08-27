package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalFollowupEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClinicalFollowupRepository extends JpaRepository<ClinicalFollowupEntity, UUID> {

    Optional<ClinicalFollowupEntity> findFirstByEncounterIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID encounterId);

    List<ClinicalFollowupEntity> findByEncounterIdAndDeletedAtIsNullOrderByFollowUpDateAsc(UUID encounterId);

    List<ClinicalFollowupEntity> findByStatusAndFollowUpDateAndReminderSentAtIsNullAndDeletedAtIsNull(
            String status, LocalDate followUpDate);
}
