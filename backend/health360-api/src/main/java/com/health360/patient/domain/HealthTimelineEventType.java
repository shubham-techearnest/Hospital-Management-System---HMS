package com.health360.patient.domain;

public final class HealthTimelineEventType {

    public static final String VITALS_RECORDED = "VITALS_RECORDED";
    public static final String LAB_VALUES_RECORDED = "LAB_VALUES_RECORDED";
    public static final String DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED";
    public static final String PROFILE_UPDATED = "PROFILE_UPDATED";
    public static final String APPOINTMENT_COMPLETED = "APPOINTMENT_COMPLETED";
    public static final String REVIEW_SUBMITTED = "REVIEW_SUBMITTED";

    private HealthTimelineEventType() {
    }
}
