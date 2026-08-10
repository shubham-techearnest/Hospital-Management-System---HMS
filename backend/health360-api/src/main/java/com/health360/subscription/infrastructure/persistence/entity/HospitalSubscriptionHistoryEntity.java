package com.health360.subscription.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "hospital", name = "hospital_subscription_history")
@Getter
@Setter
public class HospitalSubscriptionHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "subscription_id")
    private UUID subscriptionId;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "previous_plan_id")
    private UUID previousPlanId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "effective_at", nullable = false)
    private Instant effectiveAt = Instant.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "created_by")
    private UUID createdBy;
}
