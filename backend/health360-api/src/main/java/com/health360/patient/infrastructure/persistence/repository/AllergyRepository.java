package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.AllergyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AllergyRepository extends JpaRepository<AllergyEntity, UUID> {

    List<AllergyEntity> findByPatientIdAndDeletedAtIsNullOrderByName(UUID patientId);

    long countByPatientIdAndDeletedAtIsNull(UUID patientId);

    Optional<AllergyEntity> findByIdAndPatientIdAndDeletedAtIsNull(UUID id, UUID patientId);
}
