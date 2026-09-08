package com.health360.ipd.domain;

import java.util.EnumSet;
import java.util.Set;

public enum AdmissionRequestStatus {
    REQUESTED,
    UNDER_REVIEW,
    APPROVED,
    REJECTED,
    SCHEDULED,
    CANCELLED,
    ADMITTED;

    public boolean canTransitionTo(AdmissionRequestStatus target) {
        return allowedTargets().contains(target);
    }

    private Set<AdmissionRequestStatus> allowedTargets() {
        return switch (this) {
            case REQUESTED -> EnumSet.of(UNDER_REVIEW, APPROVED, REJECTED, CANCELLED);
            case UNDER_REVIEW -> EnumSet.of(APPROVED, REJECTED, CANCELLED);
            case APPROVED -> EnumSet.of(SCHEDULED, ADMITTED, CANCELLED);
            case SCHEDULED -> EnumSet.of(ADMITTED, CANCELLED, APPROVED);
            case REJECTED, CANCELLED, ADMITTED -> EnumSet.noneOf(AdmissionRequestStatus.class);
        };
    }

    public static AdmissionRequestStatus parse(String value) {
        try {
            return AdmissionRequestStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid admission request status: " + value);
        }
    }
}
