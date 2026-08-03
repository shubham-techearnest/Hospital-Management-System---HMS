package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.HealthTimelineEventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HealthTimelineEventRepository extends JpaRepository<HealthTimelineEventEntity, UUID> {

    Page<HealthTimelineEventEntity> findByPatientIdOrderByOccurredAtDesc(UUID patientId, Pageable pageable);
}
