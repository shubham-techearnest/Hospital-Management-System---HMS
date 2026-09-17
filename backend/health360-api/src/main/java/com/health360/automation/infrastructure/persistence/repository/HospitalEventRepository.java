package com.health360.automation.infrastructure.persistence.repository;

import com.health360.automation.infrastructure.persistence.entity.HospitalEventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HospitalEventRepository extends JpaRepository<HospitalEventEntity, UUID> {

    Page<HospitalEventEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByOccurredAtDesc(
            UUID tenantId, UUID hospitalId, Pageable pageable);
}
