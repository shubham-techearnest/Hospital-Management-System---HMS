package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {

    Optional<InvoiceEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<InvoiceEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByIssuedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<InvoiceEntity> findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByIssuedAtDesc(
            UUID tenantId, UUID patientId, Pageable pageable);

    boolean existsByTenantIdAndEncounterIdAndDeletedAtIsNullAndStatusNot(
            UUID tenantId, UUID encounterId, String status);

    Optional<InvoiceEntity> findFirstByTenantIdAndEncounterIdAndDeletedAtIsNullAndStatusNotOrderByIssuedAtDesc(
            UUID tenantId, UUID encounterId, String status);
}
