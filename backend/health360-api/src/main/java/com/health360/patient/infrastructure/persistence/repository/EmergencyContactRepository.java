package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.EmergencyContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContactEntity, UUID> {

    List<EmergencyContactEntity> findByPatientIdAndDeletedAtIsNullOrderByName(UUID patientId);

    Optional<EmergencyContactEntity> findByIdAndPatientIdAndDeletedAtIsNull(UUID id, UUID patientId);

    long countByPatientIdAndDeletedAtIsNull(UUID patientId);
}
