package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdAdmissionRepository extends JpaRepository<IpdAdmissionEntity, UUID> {

    Optional<IpdAdmissionEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<IpdAdmissionEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByAdmittedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<IpdAdmissionEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByAdmittedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    boolean existsByEncounterIdAndDeletedAtIsNull(UUID encounterId);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);
}
