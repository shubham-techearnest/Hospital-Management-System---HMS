package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OperationTheatreEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OperationTheatreRepository extends JpaRepository<OperationTheatreEntity, UUID> {

    Optional<OperationTheatreEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<OperationTheatreEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    boolean existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
            UUID hospitalId, UUID branchId, String code);
}
