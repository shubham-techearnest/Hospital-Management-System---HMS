package com.health360.inventory.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "InventoryStockBalance")
@Table(schema = "inventory", name = "stock_balances")
@Getter
@Setter
public class InventoryStockBalanceEntity extends BaseAuditableEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "lot_number", nullable = false, length = 60)
    private String lotNumber = "";

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Column(name = "unit_cost", precision = 12, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();
}
