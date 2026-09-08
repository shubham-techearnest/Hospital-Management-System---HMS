package com.health360.ipd.domain;

import java.util.EnumSet;
import java.util.Set;

public enum BedStatus {
    AVAILABLE,
    OCCUPIED,
    RESERVED,
    CLEANING,
    MAINTENANCE,
    BLOCKED;

    public boolean canTransitionTo(BedStatus target) {
        return allowedTargets().contains(target);
    }

    private Set<BedStatus> allowedTargets() {
        return switch (this) {
            case AVAILABLE -> EnumSet.of(RESERVED, OCCUPIED, MAINTENANCE, BLOCKED, CLEANING);
            case RESERVED -> EnumSet.of(AVAILABLE, OCCUPIED, BLOCKED, MAINTENANCE);
            case OCCUPIED -> EnumSet.of(CLEANING, AVAILABLE, MAINTENANCE);
            case CLEANING -> EnumSet.of(AVAILABLE, MAINTENANCE, BLOCKED);
            case MAINTENANCE -> EnumSet.of(AVAILABLE, BLOCKED, CLEANING);
            case BLOCKED -> EnumSet.of(AVAILABLE, MAINTENANCE);
        };
    }

    public static BedStatus parse(String value) {
        try {
            return BedStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid bed status: " + value);
        }
    }
}
