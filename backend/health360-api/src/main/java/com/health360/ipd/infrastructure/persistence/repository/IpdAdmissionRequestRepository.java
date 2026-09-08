package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionRequestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdAdmissionRequestRepository extends JpaRepository<IpdAdmissionRequestEntity, UUID> {

    Optional<IpdAdmissionRequestEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<IpdAdmissionRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<IpdAdmissionRequestEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    boolean existsBySourceEncounterIdAndStatusNotInAndDeletedAtIsNull(
            UUID sourceEncounterId, java.util.Collection<String> statuses);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, java.util.Collection<String> statuses);
}
