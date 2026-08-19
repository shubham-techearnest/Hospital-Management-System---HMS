package com.health360.laboratory.infrastructure.persistence.repository;

import com.health360.laboratory.infrastructure.persistence.entity.LabTestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LabTestRepository extends JpaRepository<LabTestEntity, UUID> {

    List<LabTestEntity> findByTenantIdAndLaboratoryIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID laboratoryId);

    Optional<LabTestEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByLaboratoryIdAndCodeAndDeletedAtIsNull(UUID laboratoryId, String code);

    @Query("""
            SELECT t FROM LabTestEntity t
            JOIN LaboratoryEntity l ON l.id = t.laboratoryId
            WHERE t.tenantId = :tenantId
              AND l.hospitalId = :hospitalId
              AND l.branchId = :branchId
              AND t.deletedAt IS NULL
              AND t.active = true
            ORDER BY t.name
            """)
    List<LabTestEntity> findActiveByHospitalBranch(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
