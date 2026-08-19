package com.health360.radiology.infrastructure.persistence.repository;

import com.health360.radiology.infrastructure.persistence.entity.ImagingModalityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ImagingModalityRepository extends JpaRepository<ImagingModalityEntity, UUID> {

    Optional<ImagingModalityEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<ImagingModalityEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);

    boolean existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
            UUID hospitalId, UUID branchId, String code);
}
