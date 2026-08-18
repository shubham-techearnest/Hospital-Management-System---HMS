package com.health360.clinical.domain;

import java.util.Map;
import java.util.Set;

public enum EncounterStatus {
    REGISTERED,
    WAITING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED;

    private static final Map<EncounterStatus, Set<EncounterStatus>> ALLOWED = Map.of(
            REGISTERED, Set.of(WAITING, IN_PROGRESS, CANCELLED),
            WAITING, Set.of(IN_PROGRESS, CANCELLED),
            IN_PROGRESS, Set.of(COMPLETED, CANCELLED),
            COMPLETED, Set.of(),
            CANCELLED, Set.of());

    public boolean canTransitionTo(EncounterStatus target) {
        return ALLOWED.getOrDefault(this, Set.of()).contains(target);
    }
}
