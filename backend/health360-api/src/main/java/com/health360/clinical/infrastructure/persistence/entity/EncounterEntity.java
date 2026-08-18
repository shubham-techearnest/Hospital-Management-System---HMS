package com.health360.clinical.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "clinical", name = "encounters")
@Getter
@Setter
public class EncounterEntity extends BaseAuditableEntity {

    @Column(name = "encounter_number", nullable = false, length = 50)
    private String encounterNumber;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "primary_doctor_id")
    private UUID primaryDoctorId;

    @Column(name = "appointment_id")
    private UUID appointmentId;

    @Column(name = "encounter_type", nullable = false, length = 30)
    private String encounterType;

    @Column(nullable = false, length = 20)
    private String status = "REGISTERED";

    @Column(name = "visit_reason", columnDefinition = "TEXT")
    private String visitReason;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;
}
