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
@Table(schema = "doctor", name = "doctor_languages")
@IdClass(DoctorLanguageEntity.DoctorLanguageId.class)
@Getter
@Setter
public class DoctorLanguageEntity {

    @Id
    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Id
    @Column(name = "language_code", nullable = false, length = 2)
    private String languageCode;

    @Getter
    @Setter
    @EqualsAndHashCode
    public static class DoctorLanguageId implements Serializable {
        private UUID doctorId;
        private String languageCode;
    }
}
