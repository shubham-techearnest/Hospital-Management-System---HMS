package com.health360.doctor.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(schema = "doctor", name = "doctor_sub_specializations")
@IdClass(DoctorSubSpecializationEntity.DoctorSubSpecializationId.class)
@Getter
@Setter
public class DoctorSubSpecializationEntity {

    @Id
    @Column(name = "doctor_id")
    private UUID doctorId;

    @Id
    @Column(name = "specialization_id")
    private UUID specializationId;

    @Getter
    @Setter
    @EqualsAndHashCode
    public static class DoctorSubSpecializationId implements Serializable {
        private UUID doctorId;
        private UUID specializationId;
    }
}
