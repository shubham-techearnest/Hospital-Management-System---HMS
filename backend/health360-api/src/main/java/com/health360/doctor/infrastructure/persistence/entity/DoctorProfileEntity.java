package com.health360.doctor.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(schema = "doctor", name = "doctor_profiles")
@Getter
@Setter
public class DoctorProfileEntity extends BaseAuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 10)
    private String title = "DR";

    @Column(name = "medical_registration_number", length = 100)
    private String medicalRegistrationNumber;

    @Column(name = "registration_council", length = 200)
    private String registrationCouncil;

    @Column(name = "registration_year")
    private Integer registrationYear;

    @Column(name = "registration_expiry")
    private LocalDate registrationExpiry;

    @Column(length = 30)
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(name = "total_years_experience")
    private Integer totalYearsExperience;

    @Column(name = "primary_specialization_id")
    private UUID primarySpecializationId;

    @Column(name = "verification_status", nullable = false, length = 30)
    private String verificationStatus = "DRAFT";

    @Column(name = "verification_rejection_reason", columnDefinition = "TEXT")
    private String verificationRejectionReason;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;
}
