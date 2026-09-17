package com.health360.automation.domain;

public final class HospitalEventTypes {
    private HospitalEventTypes() {}

    public static final String PATIENT_ADMITTED = "PATIENT_ADMITTED";
    public static final String BED_ASSIGNED = "BED_ASSIGNED";
    public static final String PATIENT_TRANSFERRED = "PATIENT_TRANSFERRED";
    public static final String BED_RELEASED = "BED_RELEASED";
    public static final String PATIENT_DISCHARGED = "PATIENT_DISCHARGED";
    public static final String ADMISSION_REQUESTED = "ADMISSION_REQUESTED";
    public static final String ADMISSION_APPROVED = "ADMISSION_APPROVED";
    public static final String ED_ARRIVAL = "ED_ARRIVAL";
    public static final String ED_TRIAGED = "ED_TRIAGED";
    public static final String ED_DISPOSITION = "ED_DISPOSITION";
    public static final String LAB_RESULT_RELEASED = "LAB_RESULT_RELEASED";
    public static final String CRITICAL_RESULT = "CRITICAL_RESULT";
    public static final String MEDICATION_DISPENSED = "MEDICATION_DISPENSED";
    public static final String STOCK_RECEIVED = "STOCK_RECEIVED";
    public static final String STOCK_ADJUSTED = "STOCK_ADJUSTED";
    public static final String STOCK_CONSUMED = "STOCK_CONSUMED";
    public static final String STOCK_LOW = "STOCK_LOW";
    public static final String PURCHASE_REQUESTED = "PURCHASE_REQUESTED";
    public static final String PURCHASE_ORDERED = "PURCHASE_ORDERED";
    public static final String GOODS_RECEIVED = "GOODS_RECEIVED";
    public static final String ASSET_CREATED = "ASSET_CREATED";
    public static final String ASSET_COMMISSIONED = "ASSET_COMMISSIONED";
    public static final String ASSET_BROKEN = "ASSET_BROKEN";
    public static final String MAINTENANCE_DUE = "MAINTENANCE_DUE";
    public static final String MAINTENANCE_COMPLETED = "MAINTENANCE_COMPLETED";
    public static final String ASSET_DISPOSED = "ASSET_DISPOSED";
    public static final String FACILITY_WORK_CREATED = "FACILITY_WORK_CREATED";
    public static final String FACILITY_WORK_COMPLETED = "FACILITY_WORK_COMPLETED";
    public static final String DIET_ORDERED = "DIET_ORDERED";
    public static final String LINEN_COLLECTED = "LINEN_COLLECTED";
    public static final String TRANSPORT_REQUESTED = "TRANSPORT_REQUESTED";
    public static final String PRE_AUTH_REQUESTED = "PRE_AUTH_REQUESTED";
    public static final String PRE_AUTH_DECIDED = "PRE_AUTH_DECIDED";
    public static final String CLAIM_SUBMITTED = "CLAIM_SUBMITTED";
    public static final String CLAIM_SETTLED = "CLAIM_SETTLED";
    public static final String BLOOD_REQUESTED = "BLOOD_REQUESTED";
    public static final String BLOOD_ISSUED = "BLOOD_ISSUED";
    public static final String BLOOD_RETURNED = "BLOOD_RETURNED";
    public static final String ROSTER_ASSIGNED = "ROSTER_ASSIGNED";
    public static final String LEAVE_REQUESTED = "LEAVE_REQUESTED";
    public static final String LEAVE_DECIDED = "LEAVE_DECIDED";
    public static final String PREDICTIVE_INSIGHT_RAISED = "PREDICTIVE_INSIGHT_RAISED";
}
