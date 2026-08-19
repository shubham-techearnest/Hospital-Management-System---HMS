package com.health360.icu.infrastructure.persistence.repository;

import com.health360.icu.infrastructure.persistence.entity.IcuBedEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IcuBedRepository extends JpaRepository<IcuBedEntity, UUID> {

    Optional<IcuBedEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<IcuBedEntity> findByTenantIdAndUnitIdAndDeletedAtIsNullOrderByBedNumberAsc(UUID tenantId, UUID unitId);

    boolean existsByUnitIdAndBedNumberAndDeletedAtIsNull(UUID unitId, String bedNumber);

    @Query("""
            SELECT b FROM IcuBedEntity b
            JOIN IcuUnitEntity u ON u.id = b.unitId
            WHERE b.tenantId = :tenantId
              AND u.hospitalId = :hospitalId
              AND u.branchId = :branchId
              AND b.deletedAt IS NULL
              AND (:status IS NULL OR b.status = :status)
            ORDER BY u.code, b.bedNumber
            """)
    List<IcuBedEntity> findByHospitalBranch(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("status") String status);

    @Query("""
            SELECT COUNT(b) FROM IcuBedEntity b
            JOIN IcuUnitEntity u ON u.id = b.unitId
            WHERE b.tenantId = :tenantId
              AND u.hospitalId = :hospitalId
              AND u.branchId = :branchId
              AND b.deletedAt IS NULL
              AND (:status IS NULL OR b.status = :status)
            """)
    long countByHospitalBranch(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("status") String status);
}
