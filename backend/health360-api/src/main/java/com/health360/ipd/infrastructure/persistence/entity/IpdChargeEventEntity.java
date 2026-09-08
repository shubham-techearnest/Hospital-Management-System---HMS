package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "charge_events")
@Getter
@Setter
public class IpdChargeEventEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "charge_type", nullable = false, length = 30)
    private String chargeType;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate = LocalDate.now();

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "invoice_line_id")
    private UUID invoiceLineId;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
