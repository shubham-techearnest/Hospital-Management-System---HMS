package com.health360.icu.infrastructure.persistence.repository;

import com.health360.icu.infrastructure.persistence.entity.IcuMonitoringRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IcuMonitoringRecordRepository extends JpaRepository<IcuMonitoringRecordEntity, UUID> {

    List<IcuMonitoringRecordEntity> findByTenantIdAndStayIdAndDeletedAtIsNullOrderByRecordedAtDesc(
            UUID tenantId, UUID stayId);
}
