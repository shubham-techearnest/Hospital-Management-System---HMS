package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.SymptomCatalogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SymptomCatalogRepository extends JpaRepository<SymptomCatalogEntity, UUID> {

    @Query("""
            SELECT s FROM SymptomCatalogEntity s
            WHERE s.tenantId = :tenantId
              AND s.hospitalId = :hospitalId
              AND (:branchId IS NULL OR s.branchId IS NULL OR s.branchId = :branchId)
            ORDER BY s.name ASC
            """)
    List<SymptomCatalogEntity> findActiveCatalog(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
