package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.SurgeryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurgeryRepository extends JpaRepository<SurgeryEntity, UUID> {

    List<SurgeryEntity> findByPatientIdAndDeletedAtIsNullOrderBySurgeryDateDesc(UUID patientId);

    Optional<SurgeryEntity> findByIdAndPatientIdAndDeletedAtIsNull(UUID id, UUID patientId);
}
