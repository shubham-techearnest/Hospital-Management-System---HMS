package com.health360.laboratory.infrastructure.persistence.repository;

import com.health360.laboratory.infrastructure.persistence.entity.LabResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LabResultRepository extends JpaRepository<LabResultEntity, UUID> {

    List<LabResultEntity> findByTenantIdAndLabOrderIdAndDeletedAtIsNullOrderByRecordedAtAsc(
            UUID tenantId, UUID labOrderId);

    long countByLabOrderIdAndDeletedAtIsNullAndStatusNot(UUID labOrderId, String status);
}
