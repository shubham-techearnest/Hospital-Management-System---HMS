package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.PriceListItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PriceListItemRepository extends JpaRepository<PriceListItemEntity, UUID> {

    @Query("""
            SELECT p FROM PriceListItemEntity p
            WHERE p.hospitalId = :hospitalId
              AND p.catalogItemId = :catalogItemId
              AND p.active = true
              AND p.deletedAt IS NULL
              AND p.effectiveFrom <= :onDate
              AND (p.effectiveTo IS NULL OR p.effectiveTo >= :onDate)
            ORDER BY p.effectiveFrom DESC
            """)
    List<PriceListItemEntity> findCurrentPrice(
            @Param("hospitalId") UUID hospitalId,
            @Param("catalogItemId") UUID catalogItemId,
            @Param("onDate") LocalDate onDate);
}
