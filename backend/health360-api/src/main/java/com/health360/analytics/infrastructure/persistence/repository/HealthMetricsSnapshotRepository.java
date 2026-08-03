package com.health360.analytics.infrastructure.persistence.repository;

import com.health360.analytics.infrastructure.persistence.entity.HealthMetricsSnapshotEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HealthMetricsSnapshotRepository extends JpaRepository<HealthMetricsSnapshotEntity, UUID> {

    Optional<HealthMetricsSnapshotEntity> findFirstByPatientIdAndTenantIdOrderByCalculatedAtDesc(
            UUID patientId, UUID tenantId);

    Page<HealthMetricsSnapshotEntity> findByPatientIdAndTenantIdOrderByCalculatedAtDesc(
            UUID patientId, UUID tenantId, Pageable pageable);
}
