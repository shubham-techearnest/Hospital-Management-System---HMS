package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdWardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdWardRepository extends JpaRepository<IpdWardEntity, UUID> {

    List<IpdWardEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    Optional<IpdWardEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(UUID hospitalId, UUID branchId, String code);
}
