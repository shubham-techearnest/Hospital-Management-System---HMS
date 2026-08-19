package com.health360.icu.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "icu", name = "icu_stays")
@Getter
@Setter
public class IcuStayEntity extends BaseAuditableEntity {

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

    @Column(name = "ipd_admission_id")
    private UUID ipdAdmissionId;

    @Column(name = "stay_number", nullable = false, length = 50)
    private String stayNumber;

    @Column(name = "admission_reason")
    private String admissionReason;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "admitted_at", nullable = false)
    private Instant admittedAt = Instant.now();

    @Column(name = "discharged_at")
    private Instant dischargedAt;
}
