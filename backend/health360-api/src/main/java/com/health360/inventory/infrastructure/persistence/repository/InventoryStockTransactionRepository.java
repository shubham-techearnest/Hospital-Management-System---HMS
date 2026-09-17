package com.health360.inventory.infrastructure.persistence.repository;

import com.health360.inventory.infrastructure.persistence.entity.InventoryStockTransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InventoryStockTransactionRepository extends JpaRepository<InventoryStockTransactionEntity, UUID> {

    Page<InventoryStockTransactionEntity> findByTenantIdAndItemIdOrderByCreatedAtDesc(
            UUID tenantId, UUID itemId, Pageable pageable);

    Page<InventoryStockTransactionEntity> findByTenantIdAndLocationIdOrderByCreatedAtDesc(
            UUID tenantId, UUID locationId, Pageable pageable);
}
