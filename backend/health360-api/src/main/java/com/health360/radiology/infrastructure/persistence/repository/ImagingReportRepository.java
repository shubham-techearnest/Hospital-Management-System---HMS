package com.health360.radiology.infrastructure.persistence.repository;

import com.health360.radiology.infrastructure.persistence.entity.ImagingReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ImagingReportRepository extends JpaRepository<ImagingReportEntity, UUID> {

    List<ImagingReportEntity> findByTenantIdAndEncounterIdAndReleasedAtIsNotNullAndDeletedAtIsNullOrderByReleasedAtDesc(
            UUID tenantId, UUID encounterId);

    Optional<ImagingReportEntity> findByImagingOrderIdAndDeletedAtIsNull(UUID imagingOrderId);
}
