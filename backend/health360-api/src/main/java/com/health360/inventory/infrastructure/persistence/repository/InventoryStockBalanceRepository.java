package com.health360.inventory.infrastructure.persistence.repository;

import com.health360.inventory.infrastructure.persistence.entity.InventoryStockBalanceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface InventoryStockBalanceRepository extends JpaRepository<InventoryStockBalanceEntity, UUID> {

    Optional<InventoryStockBalanceEntity> findByItemIdAndLocationIdAndLotNumberAndDeletedAtIsNull(
            UUID itemId, UUID locationId, String lotNumber);

    @Query("""
            SELECT COALESCE(SUM(b.quantityOnHand), 0) FROM InventoryStockBalance b
            WHERE b.itemId = :itemId AND b.deletedAt IS NULL
            """)
    Integer sumOnHand(@Param("itemId") UUID itemId);

    @Query("""
            SELECT b FROM InventoryStockBalance b
            WHERE b.tenantId = :tenantId AND b.deletedAt IS NULL
              AND b.itemId IN (
                  SELECT i.id FROM InventoryItemEntity i
                  WHERE i.tenantId = :tenantId AND i.hospitalId = :hospitalId AND i.branchId = :branchId
                    AND i.deletedAt IS NULL
              )
              AND (:locationId IS NULL OR b.locationId = :locationId)
              AND (:lowStockOnly = false OR EXISTS (
                  SELECT i2 FROM InventoryItemEntity i2
                  WHERE i2.id = b.itemId AND i2.reorderLevel IS NOT NULL
                    AND b.quantityOnHand <= i2.reorderLevel
              ))
            ORDER BY b.itemId ASC, b.locationId ASC
            """)
    Page<InventoryStockBalanceEntity> findBoard(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("locationId") UUID locationId,
            @Param("lowStockOnly") boolean lowStockOnly,
            Pageable pageable);
}
