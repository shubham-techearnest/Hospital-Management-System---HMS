package com.health360.opd.infrastructure.persistence.repository;

import com.health360.opd.infrastructure.persistence.entity.OpdDeskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OpdDeskRepository extends JpaRepository<OpdDeskEntity, UUID> {

    Optional<OpdDeskEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<OpdDeskEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    boolean existsByTenantIdAndHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String code);

    long countByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId);
}
