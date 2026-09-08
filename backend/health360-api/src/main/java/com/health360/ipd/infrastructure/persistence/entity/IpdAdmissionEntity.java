package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "admissions")
@Getter
@Setter
public class IpdAdmissionEntity extends BaseAuditableEntity {

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "primary_doctor_id")
    private UUID primaryDoctorId;

    @Column(name = "admission_number", nullable = false, length = 50)
    private String admissionNumber;

    @Column(name = "admission_reason")
    private String admissionReason;

    @Column(nullable = false, length = 20)
    private String status = "ADMITTED";

    @Column(name = "admitted_at", nullable = false)
    private Instant admittedAt = Instant.now();

    @Column(name = "discharged_at")
    private Instant dischargedAt;

    @Column(name = "admission_request_id")
    private UUID admissionRequestId;

    @Column(name = "admission_source", length = 40)
    private String admissionSource;

    @Column(name = "admission_type", length = 40)
    private String admissionType;

    @Column(name = "isolation_required", nullable = false)
    private boolean isolationRequired;

    @Column(name = "care_level", length = 40)
    private String careLevel;

    @Column(name = "active_icu_stay_id")
    private UUID activeIcuStayId;

    @Column(name = "follow_up_appointment_id")
    private UUID followUpAppointmentId;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "closed_by")
    private UUID closedBy;

    @Column(name = "readmitted_from_admission_id")
    private UUID readmittedFromAdmissionId;
}
