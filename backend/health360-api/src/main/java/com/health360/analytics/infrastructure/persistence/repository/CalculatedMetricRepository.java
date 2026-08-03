package com.health360.analytics.infrastructure.persistence.repository;

import com.health360.analytics.infrastructure.persistence.entity.CalculatedMetricEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CalculatedMetricRepository extends JpaRepository<CalculatedMetricEntity, UUID> {

    List<CalculatedMetricEntity> findBySnapshotIdOrderByMetricType(UUID snapshotId);

    Optional<CalculatedMetricEntity> findBySnapshotIdAndMetricType(UUID snapshotId, String metricType);
}
