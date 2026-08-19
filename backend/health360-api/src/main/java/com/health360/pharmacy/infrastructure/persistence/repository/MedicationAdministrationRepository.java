package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.pharmacy.infrastructure.persistence.entity.MedicationAdministrationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministrationEntity, UUID> {

    List<MedicationAdministrationEntity> findByEncounterIdAndDeletedAtIsNullOrderByAdministeredAtDesc(UUID encounterId);

    List<MedicationAdministrationEntity> findByMedicationOrderItemIdAndDeletedAtIsNullOrderByAdministeredAtDesc(
            UUID medicationOrderItemId);
}
