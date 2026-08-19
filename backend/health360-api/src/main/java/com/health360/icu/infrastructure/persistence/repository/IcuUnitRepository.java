package com.health360.icu.infrastructure.persistence.repository;

import com.health360.icu.infrastructure.persistence.entity.IcuUnitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IcuUnitRepository extends JpaRepository<IcuUnitEntity, UUID> {

    List<IcuUnitEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    Optional<IcuUnitEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(UUID hospitalId, UUID branchId, String code);
}
