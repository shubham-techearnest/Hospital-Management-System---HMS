package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.DiagnosisCatalogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DiagnosisCatalogRepository extends JpaRepository<DiagnosisCatalogEntity, UUID> {

    @Query("""
            SELECT d FROM DiagnosisCatalogEntity d
            WHERE (d.hospitalId IS NULL
                OR (d.tenantId = :tenantId AND d.hospitalId = :hospitalId))
              AND (:branchId IS NULL OR d.branchId IS NULL OR d.branchId = :branchId)
            ORDER BY d.icdCode ASC
            """)
    List<DiagnosisCatalogEntity> findActiveCatalog(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
