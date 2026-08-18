package com.health360.opd.domain;

import java.util.Map;
import java.util.Set;

public enum QueueEntryStatus {
    WAITING,
    CALLED,
    IN_SERVICE,
    COMPLETED,
    CANCELLED,
    NO_SHOW;

    private static final Map<QueueEntryStatus, Set<QueueEntryStatus>> ALLOWED = Map.of(
            WAITING, Set.of(CALLED, CANCELLED, NO_SHOW),
            CALLED, Set.of(IN_SERVICE, WAITING, CANCELLED),
            IN_SERVICE, Set.of(COMPLETED, CANCELLED),
            COMPLETED, Set.of(),
            CANCELLED, Set.of(),
            NO_SHOW, Set.of());

    public boolean canTransitionTo(QueueEntryStatus target) {
        return ALLOWED.getOrDefault(this, Set.of()).contains(target);
    }
}
