package com.health360.billing.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(schema = "billing", name = "charge_postings")
@Getter
@Setter
public class ChargePostingEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "catalog_item_id")
    private UUID catalogItemId;

    @Column(name = "catalog_code", nullable = false, length = 60)
    private String catalogCode;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(nullable = false, length = 30)
    private String status = "DRY_RUN";

    @Column(name = "source_event_id")
    private UUID sourceEventId;

    @Column(name = "source_event_type", nullable = false, length = 80)
    private String sourceEventType;

    @Column(name = "source_entity_type", length = 80)
    private String sourceEntityType;

    @Column(name = "source_entity_id")
    private UUID sourceEntityId;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "invoice_line_id")
    private UUID invoiceLineId;

    @Column(nullable = false, length = 20)
    private String mode = "DRY_RUN";
}
