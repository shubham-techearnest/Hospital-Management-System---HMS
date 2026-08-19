package com.health360.laboratory.infrastructure.persistence.repository;

import com.health360.laboratory.infrastructure.persistence.entity.LabSampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LabSampleRepository extends JpaRepository<LabSampleEntity, UUID> {

    Optional<LabSampleEntity> findByLabOrderIdAndDeletedAtIsNull(UUID labOrderId);
}
