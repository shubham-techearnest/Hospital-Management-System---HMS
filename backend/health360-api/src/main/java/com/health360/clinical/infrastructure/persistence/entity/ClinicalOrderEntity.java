package com.health360.clinical.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "clinical", name = "orders")
@Getter
@Setter
public class ClinicalOrderEntity extends BaseAuditableEntity {

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "order_number", nullable = false, length = 50)
    private String orderNumber;

    @Column(name = "order_type", nullable = false, length = 20)
    private String orderType;

    @Column(nullable = false, length = 20)
    private String status = "ORDERED";

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "ordered_at", nullable = false)
    private Instant orderedAt = Instant.now();
}
