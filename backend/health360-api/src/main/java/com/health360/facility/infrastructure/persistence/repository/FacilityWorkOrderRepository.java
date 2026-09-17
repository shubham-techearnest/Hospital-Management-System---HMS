package com.health360.facility.infrastructure.persistence.repository;

import com.health360.facility.infrastructure.persistence.entity.FacilityWorkOrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacilityWorkOrderRepository extends JpaRepository<FacilityWorkOrderEntity, UUID> {

    Optional<FacilityWorkOrderEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<FacilityWorkOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByOpenedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, Pageable pageable);

    Page<FacilityWorkOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByOpenedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, Pageable pageable);

    Page<FacilityWorkOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndWorkTypeAndDeletedAtIsNullOrderByOpenedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String workType, Pageable pageable);

    Page<FacilityWorkOrderEntity> findByTenantIdAndHospitalIdAndBranchIdAndWorkTypeAndStatusAndDeletedAtIsNullOrderByOpenedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String workType, String status, Pageable pageable);

    boolean existsByBedIdAndWorkTypeAndStatusInAndDeletedAtIsNull(
            UUID bedId, String workType, List<String> statuses);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, Collection<String> statuses);
}
