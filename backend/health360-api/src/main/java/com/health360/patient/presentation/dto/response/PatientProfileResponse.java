package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PatientProfileResponse {
    UUID id;
    boolean consentAccepted;
    Instant consentAcceptedAt;
    int completionScore;
    BasicInfoSection basicInfo;
    ContactInfoSection contactInfo;
    PhysicalMeasurementsSection physicalMeasurements;
    LifestyleSection lifestyle;
    HealthGoalsSection healthGoals;
    List<AllergyResponse> allergies;
    List<MedicationResponse> medications;
    List<SurgeryResponse> surgeries;
    List<ChronicConditionResponse> chronicConditions;
    List<EmergencyContactResponse> emergencyContacts;

    @Value
    @Builder
    public static class BasicInfoSection {
        LocalDate dateOfBirth;
        String gender;
        String bloodGroup;
        String maritalStatus;
        String nationality;
        String profilePhotoUrl;
    }

    @Value
    @Builder
    public static class AddressSection {
        String line1;
        String line2;
        String city;
        String state;
        String pincode;
        String country;
    }

    @Value
    @Builder
    public static class ContactInfoSection {
        String primaryPhone;
        String secondaryPhone;
        AddressSection permanentAddress;
        AddressSection currentAddress;
    }

    @Value
    @Builder
    public static class PhysicalMeasurementsSection {
        BigDecimal heightCm;
        BigDecimal weightKg;
        BigDecimal waistCm;
        BigDecimal hipCm;
        BigDecimal neckCm;
        BigDecimal bodyFatPercent;
        Instant measuredAt;
    }

    @Value
    @Builder
    public static class LifestyleSection {
        String smokingStatus;
        String smokingFrequency;
        String alcoholConsumption;
        String exerciseFrequency;
        String exerciseType;
        Integer exerciseDurationMinutes;
        String occupationType;
        BigDecimal averageSleepHours;
        String dietaryPreference;
        Integer stressLevel;
    }

    @Value
    @Builder
    public static class HealthGoalsSection {
        BigDecimal targetWeightKg;
        Integer dailyStepsGoal;
        BigDecimal sleepHoursGoal;
        Integer waterIntakeMlGoal;
        Integer weeklyExerciseMinutesGoal;
    }

    @Value
    @Builder
    public static class AllergyResponse {
        UUID id;
        String name;
        String severity;
        String reaction;
        LocalDate diagnosedDate;
    }

    @Value
    @Builder
    public static class MedicationResponse {
        UUID id;
        String name;
        String dosage;
        String frequency;
        String route;
        LocalDate startDate;
        LocalDate endDate;
        String prescribingDoctor;
    }

    @Value
    @Builder
    public static class SurgeryResponse {
        UUID id;
        String procedureName;
        LocalDate surgeryDate;
        String hospitalName;
        String notes;
    }

    @Value
    @Builder
    public static class ChronicConditionResponse {
        UUID id;
        String conditionName;
        LocalDate diagnosedDate;
        String status;
        String notes;
    }

    @Value
    @Builder
    public static class EmergencyContactResponse {
        UUID id;
        String name;
        String relationship;
        String phone;
        String email;
        boolean primary;
    }

    @Value
    @Builder
    public static class PhysicalMeasurementHistoryResponse {
        UUID id;
        BigDecimal heightCm;
        BigDecimal weightKg;
        BigDecimal waistCm;
        BigDecimal hipCm;
        BigDecimal neckCm;
        BigDecimal bodyFatPercent;
        Instant measuredAt;
    }

    @Value
    @Builder
    public static class ProfileCompletionResponse {
        int completionScore;
        List<SectionCompletion> sections;

        @Value
        @Builder
        public static class SectionCompletion {
            String name;
            int weight;
            boolean completed;
            List<String> missingFields;
        }
    }
}
