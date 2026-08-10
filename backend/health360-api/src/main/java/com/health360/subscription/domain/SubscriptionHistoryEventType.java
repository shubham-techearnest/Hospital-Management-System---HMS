package com.health360.subscription.domain;

public enum SubscriptionHistoryEventType {
    INITIAL,
    RENEWAL,
    UPGRADE,
    DOWNGRADE,
    CANCELLATION,
    EXPIRATION,
    PLAN_CHANGE,
    SUSPENSION,
    REACTIVATION
}
