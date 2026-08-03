package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.VitalSignRecordEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface VitalSignRecordRepository extends JpaRepository<VitalSignRecordEntity, UUID> {

    Page<VitalSignRecordEntity> findByPatientIdAndRecordedAtBetweenOrderByRecordedAtDesc(
            UUID patientId, Instant from, Instant to, Pageable pageable);

    Page<VitalSignRecordEntity> findByPatientIdOrderByRecordedAtDesc(UUID patientId, Pageable pageable);

    Optional<VitalSignRecordEntity> findFirstByPatientIdOrderByRecordedAtDesc(UUID patientId);

    long countByPatientId(UUID patientId);
}
