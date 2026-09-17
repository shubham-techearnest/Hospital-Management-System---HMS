package com.health360.billing.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "billing", name = "service_catalog_items")
@Getter
@Setter
public class ServiceCatalogItemEntity extends BaseAuditableEntity {

    @Column(nullable = false, length = 60)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 40)
    private String category = "GENERAL";

    @Column(name = "trigger_event_type", length = 80)
    private String triggerEventType;

    @Column(nullable = false)
    private boolean active = true;
}
