package com.health360.laboratory.infrastructure.persistence.repository;

import com.health360.laboratory.infrastructure.persistence.entity.LaboratoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LaboratoryRepository extends JpaRepository<LaboratoryEntity, UUID> {

    List<LaboratoryEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    Optional<LaboratoryEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(UUID hospitalId, UUID branchId, String code);
}
