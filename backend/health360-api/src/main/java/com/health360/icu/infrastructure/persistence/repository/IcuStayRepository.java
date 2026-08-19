package com.health360.icu.infrastructure.persistence.repository;

import com.health360.icu.infrastructure.persistence.entity.IcuStayEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IcuStayRepository extends JpaRepository<IcuStayEntity, UUID> {

    Optional<IcuStayEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<IcuStayEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByAdmittedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<IcuStayEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByAdmittedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);
}
