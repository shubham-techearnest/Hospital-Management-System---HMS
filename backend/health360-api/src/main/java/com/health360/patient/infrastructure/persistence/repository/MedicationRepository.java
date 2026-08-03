package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.MedicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicationRepository extends JpaRepository<MedicationEntity, UUID> {

    List<MedicationEntity> findByPatientIdAndDeletedAtIsNullOrderByName(UUID patientId);

    long countByPatientIdAndDeletedAtIsNull(UUID patientId);

    Optional<MedicationEntity> findByIdAndPatientIdAndDeletedAtIsNull(UUID id, UUID patientId);
}
