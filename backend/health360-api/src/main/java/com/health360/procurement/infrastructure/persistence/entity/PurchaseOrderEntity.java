package com.health360.procurement.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity(name = "ProcurementPurchaseOrder")
@Table(schema = "procurement", name = "purchase_orders")
@Getter
@Setter
public class PurchaseOrderEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "purchase_request_id", nullable = false)
    private UUID purchaseRequestId;

    @Column(name = "order_number", nullable = false, length = 40)
    private String orderNumber;

    @Column(nullable = false, length = 30)
    private String status = "ISSUED";

    @Column(name = "vendor_name", length = 200)
    private String vendorName;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt = Instant.now();

    @Column(name = "issued_by")
    private UUID issuedBy;
}
