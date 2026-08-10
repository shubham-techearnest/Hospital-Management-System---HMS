package com.health360.subscription.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(schema = "shared", name = "subscription_plans")
@Getter
@Setter
public class SubscriptionPlanEntity extends BaseAuditableEntity {

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "billing_cycle", nullable = false, length = 20)
    private String billingCycle = "MONTHLY";

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "trial_days")
    private Integer trialDays;
}
