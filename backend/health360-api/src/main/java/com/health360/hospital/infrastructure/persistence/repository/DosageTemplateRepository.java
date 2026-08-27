package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.DosageTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DosageTemplateRepository extends JpaRepository<DosageTemplateEntity, UUID> {

    @Query("""
            SELECT d FROM DosageTemplateEntity d
            WHERE (d.hospitalId IS NULL
                OR (d.tenantId = :tenantId AND d.hospitalId = :hospitalId))
              AND (:branchId IS NULL OR d.branchId IS NULL OR d.branchId = :branchId)
            ORDER BY d.label ASC
            """)
    List<DosageTemplateEntity> findActiveCatalog(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId);
}
