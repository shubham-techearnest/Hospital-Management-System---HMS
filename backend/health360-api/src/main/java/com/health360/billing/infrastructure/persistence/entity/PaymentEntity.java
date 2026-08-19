package com.health360.billing.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "billing", name = "payments")
@Getter
@Setter
public class PaymentEntity extends BaseAuditableEntity {

    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(nullable = false, length = 30)
    private String status = "CAPTURED";

    @Column(nullable = false, length = 30)
    private String gateway = "MANUAL";

    @Column(name = "gateway_payment_id", length = 100)
    private String gatewayPaymentId;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod = "CASH";

    @Column(name = "paid_at", nullable = false)
    private Instant paidAt = Instant.now();

    @Column(columnDefinition = "TEXT")
    private String notes;
}
