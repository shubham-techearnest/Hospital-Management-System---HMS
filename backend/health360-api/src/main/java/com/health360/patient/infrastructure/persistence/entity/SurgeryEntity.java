package com.health360.patient.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(schema = "patient", name = "surgeries")
@Getter
@Setter
public class SurgeryEntity extends BaseAuditableEntity {

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "procedure_name", nullable = false, length = 200)
    private String procedureName;

    @Column(name = "surgery_date")
    private LocalDate surgeryDate;

    @Column(name = "hospital_name", length = 200)
    private String hospitalName;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
