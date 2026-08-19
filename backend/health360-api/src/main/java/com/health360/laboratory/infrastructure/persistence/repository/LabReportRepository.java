package com.health360.laboratory.infrastructure.persistence.repository;

import com.health360.laboratory.infrastructure.persistence.entity.LabReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LabReportRepository extends JpaRepository<LabReportEntity, UUID> {

    List<LabReportEntity> findByTenantIdAndEncounterIdAndDeletedAtIsNullOrderByReleasedAtDesc(
            UUID tenantId, UUID encounterId);

    Optional<LabReportEntity> findByLabOrderIdAndDeletedAtIsNull(UUID labOrderId);
}
