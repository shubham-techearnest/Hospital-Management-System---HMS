package com.health360.patient.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "patient", name = "hospital_registrations")
@Getter
@Setter
public class HospitalRegistrationEntity extends BaseAuditableEntity {

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    @Column(name = "registered_by", nullable = false)
    private UUID registeredBy;

    @Column(name = "registration_number", length = 30)
    private String registrationNumber;
}
