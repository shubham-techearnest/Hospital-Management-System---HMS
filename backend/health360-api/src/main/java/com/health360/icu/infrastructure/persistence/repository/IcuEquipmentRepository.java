package com.health360.icu.infrastructure.persistence.repository;

import com.health360.icu.infrastructure.persistence.entity.IcuEquipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IcuEquipmentRepository extends JpaRepository<IcuEquipmentEntity, UUID> {

    List<IcuEquipmentEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    Optional<IcuEquipmentEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(UUID hospitalId, UUID branchId, String code);
}
