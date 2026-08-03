package com.health360.doctor.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "doctor", name = "qualifications")
@Getter
@Setter
public class QualificationEntity extends BaseAuditableEntity {

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(nullable = false, length = 200)
    private String degree;

    @Column(nullable = false, length = 200)
    private String institution;

    @Column(name = "year_of_completion", nullable = false)
    private Integer yearOfCompletion;

    @Column(nullable = false, length = 2)
    private String country = "IN";
}
