package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.PhysicalMeasurementHistoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PhysicalMeasurementHistoryRepository extends JpaRepository<PhysicalMeasurementHistoryEntity, UUID> {

    Page<PhysicalMeasurementHistoryEntity> findByPatientIdOrderByMeasuredAtDesc(UUID patientId, Pageable pageable);
}
