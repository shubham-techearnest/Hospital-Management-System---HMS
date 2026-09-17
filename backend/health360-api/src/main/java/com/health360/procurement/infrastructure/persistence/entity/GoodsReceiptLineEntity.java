package com.health360.procurement.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "ProcurementGoodsReceiptLine")
@Table(schema = "procurement", name = "goods_receipt_lines")
@Getter
@Setter
public class GoodsReceiptLineEntity extends BaseAuditableEntity {

    @Column(name = "goods_receipt_id", nullable = false)
    private UUID goodsReceiptId;

    @Column(name = "purchase_order_line_id", nullable = false)
    private UUID purchaseOrderLineId;

    @Column(name = "inventory_item_id")
    private UUID inventoryItemId;

    @Column(name = "quantity_received", nullable = false)
    private Integer quantityReceived;

    @Column(name = "lot_number", nullable = false, length = 60)
    private String lotNumber = "";

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "unit_cost")
    private BigDecimal unitCost;
}
