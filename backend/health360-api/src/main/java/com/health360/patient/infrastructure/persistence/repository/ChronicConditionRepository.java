package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.ChronicConditionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChronicConditionRepository extends JpaRepository<ChronicConditionEntity, UUID> {

    List<ChronicConditionEntity> findByPatientIdAndDeletedAtIsNullOrderByConditionName(UUID patientId);

    long countByPatientIdAndDeletedAtIsNull(UUID patientId);

    Optional<ChronicConditionEntity> findByIdAndPatientIdAndDeletedAtIsNull(UUID id, UUID patientId);
}
