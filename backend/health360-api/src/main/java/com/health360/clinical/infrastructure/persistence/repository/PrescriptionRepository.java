package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.PrescriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<PrescriptionEntity, UUID> {

    List<PrescriptionEntity> findByEncounterIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID encounterId);

    List<PrescriptionEntity> findByTenantIdAndPatientIdAndStatusAndDeletedAtIsNullOrderBySignedAtDesc(
            UUID tenantId, UUID patientId, String status);

    List<PrescriptionEntity> findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID patientId);

    Optional<PrescriptionEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByEncounterIdAndStatusAndDeletedAtIsNull(UUID encounterId, String status);

    long countByTenantIdAndCreatedAtGreaterThanEqualAndDeletedAtIsNull(UUID tenantId, java.time.Instant from);
}
