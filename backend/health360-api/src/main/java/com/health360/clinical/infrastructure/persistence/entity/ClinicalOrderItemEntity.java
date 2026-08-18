package com.health360.clinical.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "clinical", name = "order_items")
@Getter
@Setter
public class ClinicalOrderItemEntity extends BaseAuditableEntity {

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "item_code", length = 100)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 300)
    private String itemName;

    @Column(name = "item_reference_id")
    private UUID itemReferenceId;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(nullable = false, length = 20)
    private String status = "ORDERED";
}
