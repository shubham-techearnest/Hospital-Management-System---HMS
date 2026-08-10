package com.health360.subscription.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "shared", name = "subscription_plan_limits")
@Getter
@Setter
public class SubscriptionPlanLimitEntity extends BaseAuditableEntity {

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "limit_key", nullable = false, length = 100)
    private String limitKey;

    @Column(name = "limit_value", nullable = false)
    private long limitValue;
}
