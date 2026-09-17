package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.ChargeExceptionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChargeExceptionRepository extends JpaRepository<ChargeExceptionEntity, UUID> {

    Page<ChargeExceptionEntity> findByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, String status, Pageable pageable);

    Page<ChargeExceptionEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, Pageable pageable);

    Optional<ChargeExceptionEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);
}
