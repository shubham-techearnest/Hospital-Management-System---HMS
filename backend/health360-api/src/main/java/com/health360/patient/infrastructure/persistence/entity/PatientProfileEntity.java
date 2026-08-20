package com.health360.patient.infrastructure.persistence.entity;

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
@Table(schema = "patient", name = "patient_profiles")
@Getter
@Setter
public class PatientProfileEntity extends BaseAuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "consent_accepted", nullable = false)
    private boolean consentAccepted;

    @Column(name = "consent_accepted_at")
    private Instant consentAcceptedAt;

    @Column(name = "completion_score", nullable = false)
    private int completionScore;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 30)
    private String gender;

    @Column(name = "blood_group", length = 20)
    private String bloodGroup;

    @Column(name = "marital_status", length = 20)
    private String maritalStatus;

    @Column(length = 2)
    private String nationality;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(name = "primary_phone", length = 20)
    private String primaryPhone;

    @Column(name = "secondary_phone", length = 20)
    private String secondaryPhone;

    @Column(name = "permanent_address_line1", length = 200)
    private String permanentAddressLine1;

    @Column(name = "permanent_address_line2", length = 200)
    private String permanentAddressLine2;

    @Column(name = "permanent_city", length = 100)
    private String permanentCity;

    @Column(name = "permanent_state", length = 100)
    private String permanentState;

    @Column(name = "permanent_pincode", length = 10)
    private String permanentPincode;

    @Column(name = "permanent_country", length = 2)
    private String permanentCountry;

    @Column(name = "current_address_line1", length = 200)
    private String currentAddressLine1;

    @Column(name = "current_address_line2", length = 200)
    private String currentAddressLine2;

    @Column(name = "current_city", length = 100)
    private String currentCity;

    @Column(name = "current_state", length = 100)
    private String currentState;

    @Column(name = "current_pincode", length = 10)
    private String currentPincode;

    @Column(name = "current_country", length = 2)
    private String currentCountry;

    @Column(name = "height_cm", precision = 5, scale = 1)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 1)
    private BigDecimal weightKg;

    @Column(name = "waist_cm", precision = 5, scale = 1)
    private BigDecimal waistCm;

    @Column(name = "hip_cm", precision = 5, scale = 1)
    private BigDecimal hipCm;

    @Column(name = "neck_cm", precision = 5, scale = 1)
    private BigDecimal neckCm;

    @Column(name = "body_fat_percent", precision = 4, scale = 1)
    private BigDecimal bodyFatPercent;

    @Column(name = "measured_at")
    private Instant measuredAt;

    @Column(name = "smoking_status", length = 20)
    private String smokingStatus;

    @Column(name = "smoking_frequency", length = 20)
    private String smokingFrequency;

    @Column(name = "alcohol_consumption", length = 20)
    private String alcoholConsumption;

    @Column(name = "exercise_frequency", length = 20)
    private String exerciseFrequency;

    @Column(name = "exercise_type", length = 100)
    private String exerciseType;

    @Column(name = "exercise_duration_minutes")
    private Integer exerciseDurationMinutes;

    @Column(name = "occupation_type", length = 20)
    private String occupationType;

    @Column(name = "average_sleep_hours", precision = 3, scale = 1)
    private BigDecimal averageSleepHours;

    @Column(name = "dietary_preference", length = 20)
    private String dietaryPreference;

    @Column(name = "stress_level")
    private Integer stressLevel;

    @Column(name = "target_weight_kg", precision = 5, scale = 1)
    private BigDecimal targetWeightKg;

    @Column(name = "daily_steps_goal")
    private Integer dailyStepsGoal;

    @Column(name = "sleep_hours_goal", precision = 3, scale = 1)
    private BigDecimal sleepHoursGoal;

    @Column(name = "water_intake_ml_goal")
    private Integer waterIntakeMlGoal;

    @Column(name = "weekly_exercise_minutes_goal")
    private Integer weeklyExerciseMinutesGoal;

    @Column(length = 20)
    private String uhid;

    @Column(name = "legal_first_name", length = 100)
    private String legalFirstName;

    @Column(name = "legal_last_name", length = 100)
    private String legalLastName;

    @Column(name = "registration_source", length = 30, nullable = false)
    private String registrationSource = "APP";
}
