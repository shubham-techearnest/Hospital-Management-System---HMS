package com.health360.procurement.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity(name = "ProcurementPurchaseRequestLine")
@Table(schema = "procurement", name = "purchase_request_lines")
@Getter
@Setter
public class PurchaseRequestLineEntity extends BaseAuditableEntity {

    @Column(name = "purchase_request_id", nullable = false)
    private UUID purchaseRequestId;

    @Column(name = "inventory_item_id")
    private UUID inventoryItemId;

    @Column(name = "item_code", nullable = false, length = 40)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_of_measure", nullable = false, length = 20)
    private String unitOfMeasure = "EACH";

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false)
    private BigDecimal lineTotal = BigDecimal.ZERO;
}
