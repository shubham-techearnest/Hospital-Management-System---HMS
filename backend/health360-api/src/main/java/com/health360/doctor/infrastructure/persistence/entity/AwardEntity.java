package com.health360.doctor.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "doctor", name = "awards")
@Getter
@Setter
public class AwardEntity extends BaseAuditableEntity {

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 200)
    private String organization;

    @Column(name = "award_year")
    private Integer awardYear;
}
