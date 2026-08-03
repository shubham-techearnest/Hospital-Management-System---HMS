package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PatientProfileRepository extends JpaRepository<PatientProfileEntity, UUID> {

    Optional<PatientProfileEntity> findByTenantIdAndUserIdAndDeletedAtIsNull(UUID tenantId, UUID userId);
}
