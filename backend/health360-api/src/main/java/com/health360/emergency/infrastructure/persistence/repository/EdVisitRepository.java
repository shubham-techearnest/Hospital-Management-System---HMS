package com.health360.emergency.infrastructure.persistence.repository;

import com.health360.emergency.infrastructure.persistence.entity.EdVisitEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface EdVisitRepository extends JpaRepository<EdVisitEntity, UUID> {

    Optional<EdVisitEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<EdVisitEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNullOrderByArrivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Collection<String> statuses, Pageable pageable);

    Page<EdVisitEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByArrivedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, Collection<String> statuses);
}
