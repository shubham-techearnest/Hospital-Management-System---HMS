package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.HospitalIpdServiceSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HospitalIpdServiceSettingsRepository extends JpaRepository<HospitalIpdServiceSettingsEntity, UUID> {

    Optional<HospitalIpdServiceSettingsEntity> findByHospitalIdAndTenantIdAndDeletedAtIsNull(
            UUID hospitalId, UUID tenantId);
}
