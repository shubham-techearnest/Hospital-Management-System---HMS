package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionPayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdAdmissionPayerRepository extends JpaRepository<IpdAdmissionPayerEntity, UUID> {

    List<IpdAdmissionPayerEntity> findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByCreatedAtAsc(
            UUID tenantId, UUID admissionId);

    Optional<IpdAdmissionPayerEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<IpdAdmissionPayerEntity> findFirstByTenantIdAndAdmissionIdAndPrimaryPayerTrueAndDeletedAtIsNull(
            UUID tenantId, UUID admissionId);
}
