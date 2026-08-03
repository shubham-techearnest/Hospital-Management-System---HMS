package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.LabValueRecordEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LabValueRecordRepository extends JpaRepository<LabValueRecordEntity, UUID> {

    Page<LabValueRecordEntity> findByPatientIdOrderByRecordedAtDesc(UUID patientId, Pageable pageable);

    Optional<LabValueRecordEntity> findFirstByPatientIdOrderByRecordedAtDesc(UUID patientId);

    long countByPatientId(UUID patientId);
}
