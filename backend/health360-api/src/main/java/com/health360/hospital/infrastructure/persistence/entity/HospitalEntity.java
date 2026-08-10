package com.health360.hospital.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(schema = "hospital", name = "hospitals")
@Getter
@Setter
public class HospitalEntity extends BaseAuditableEntity {

    @Column(name = "admin_user_id", nullable = false)
    private UUID adminUserId;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(name = "registration_number", nullable = false, length = 100)
    private String registrationNumber;

    @Column(name = "hospital_type", nullable = false, length = 20)
    private String hospitalType;

    @Column(name = "established_year")
    private Integer establishedYear;

    @Column(name = "total_bed_count")
    private Integer totalBedCount;

    @Column(length = 10)
    private String accreditation;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "emergency_available_24x7", nullable = false)
    private boolean emergencyAvailable24x7;

    @Column(name = "emergency_phone", length = 20)
    private String emergencyPhone;

    @Column(name = "ambulance_available", nullable = false)
    private boolean ambulanceAvailable;

    @Column(name = "icu_available", nullable = false)
    private boolean icuAvailable;

    @Column(name = "icu_bed_count")
    private Integer icuBedCount;

    @Column(name = "icu_type", length = 20)
    private String icuType;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";
}
