package com.health360.insurance.infrastructure.persistence.repository;

import com.health360.insurance.infrastructure.persistence.entity.InsurancePayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InsurancePayerRepository extends JpaRepository<InsurancePayerEntity, UUID> {

    Optional<InsurancePayerEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<InsurancePayerEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId);

    boolean existsByHospitalIdAndCodeAndDeletedAtIsNull(UUID hospitalId, String code);
}
