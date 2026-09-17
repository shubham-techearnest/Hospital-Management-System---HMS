package com.health360.blood.infrastructure.persistence.repository;

import com.health360.blood.infrastructure.persistence.entity.BloodUnitEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BloodUnitRepository extends JpaRepository<BloodUnitEntity, UUID> {

    Optional<BloodUnitEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndUnitNumberAndDeletedAtIsNull(UUID hospitalId, String unitNumber);

    Page<BloodUnitEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<BloodUnitEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    List<BloodUnitEntity> findByTenantIdAndHospitalIdAndBranchIdAndProductTypeAndBloodGroupAndStatusAndDeletedAtIsNullOrderByExpiresAtAsc(
            UUID tenantId, UUID hospitalId, UUID branchId, String productType, String bloodGroup, String status);
}
