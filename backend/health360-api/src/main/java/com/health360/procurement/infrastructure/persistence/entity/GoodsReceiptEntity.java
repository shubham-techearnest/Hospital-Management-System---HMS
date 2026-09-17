package com.health360.procurement.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "ProcurementGoodsReceipt")
@Table(schema = "procurement", name = "goods_receipts")
@Getter
@Setter
public class GoodsReceiptEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "purchase_order_id", nullable = false)
    private UUID purchaseOrderId;

    @Column(name = "grn_number", nullable = false, length = 40)
    private String grnNumber;

    @Column(nullable = false, length = 30)
    private String status = "POSTED";

    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();

    @Column(name = "received_by")
    private UUID receivedBy;
}
