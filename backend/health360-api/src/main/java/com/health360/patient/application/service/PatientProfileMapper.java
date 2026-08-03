package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.*;
import com.health360.patient.presentation.dto.response.PatientProfileResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PatientProfileMapper {

    public PatientProfileResponse toFullResponse(
            PatientProfileEntity profile,
            List<AllergyEntity> allergies,
            List<MedicationEntity> medications,
            List<SurgeryEntity> surgeries,
            List<ChronicConditionEntity> conditions,
            List<EmergencyContactEntity> contacts) {

        return PatientProfileResponse.builder()
                .id(profile.getId())
                .consentAccepted(profile.isConsentAccepted())
                .consentAcceptedAt(profile.getConsentAcceptedAt())
                .completionScore(profile.getCompletionScore())
                .basicInfo(PatientProfileResponse.BasicInfoSection.builder()
                        .dateOfBirth(profile.getDateOfBirth())
                        .gender(profile.getGender())
                        .bloodGroup(profile.getBloodGroup())
                        .maritalStatus(profile.getMaritalStatus())
                        .nationality(profile.getNationality())
                        .profilePhotoUrl(profile.getProfilePhotoUrl())
                        .build())
                .contactInfo(PatientProfileResponse.ContactInfoSection.builder()
                        .primaryPhone(profile.getPrimaryPhone())
                        .secondaryPhone(profile.getSecondaryPhone())
                        .permanentAddress(buildAddress(
                                profile.getPermanentAddressLine1(), profile.getPermanentAddressLine2(),
                                profile.getPermanentCity(), profile.getPermanentState(),
                                profile.getPermanentPincode(), profile.getPermanentCountry()))
                        .currentAddress(buildAddress(
                                profile.getCurrentAddressLine1(), profile.getCurrentAddressLine2(),
                                profile.getCurrentCity(), profile.getCurrentState(),
                                profile.getCurrentPincode(), profile.getCurrentCountry()))
                        .build())
                .physicalMeasurements(PatientProfileResponse.PhysicalMeasurementsSection.builder()
                        .heightCm(profile.getHeightCm())
                        .weightKg(profile.getWeightKg())
                        .waistCm(profile.getWaistCm())
                        .hipCm(profile.getHipCm())
                        .neckCm(profile.getNeckCm())
                        .bodyFatPercent(profile.getBodyFatPercent())
                        .measuredAt(profile.getMeasuredAt())
                        .build())
                .lifestyle(PatientProfileResponse.LifestyleSection.builder()
                        .smokingStatus(profile.getSmokingStatus())
                        .smokingFrequency(profile.getSmokingFrequency())
                        .alcoholConsumption(profile.getAlcoholConsumption())
                        .exerciseFrequency(profile.getExerciseFrequency())
                        .exerciseType(profile.getExerciseType())
                        .exerciseDurationMinutes(profile.getExerciseDurationMinutes())
                        .occupationType(profile.getOccupationType())
                        .averageSleepHours(profile.getAverageSleepHours())
                        .dietaryPreference(profile.getDietaryPreference())
                        .stressLevel(profile.getStressLevel())
                        .build())
                .healthGoals(PatientProfileResponse.HealthGoalsSection.builder()
                        .targetWeightKg(profile.getTargetWeightKg())
                        .dailyStepsGoal(profile.getDailyStepsGoal())
                        .sleepHoursGoal(profile.getSleepHoursGoal())
                        .waterIntakeMlGoal(profile.getWaterIntakeMlGoal())
                        .weeklyExerciseMinutesGoal(profile.getWeeklyExerciseMinutesGoal())
                        .build())
                .allergies(allergies.stream().map(this::toAllergy).toList())
                .medications(medications.stream().map(this::toMedication).toList())
                .surgeries(surgeries.stream().map(this::toSurgery).toList())
                .chronicConditions(conditions.stream().map(this::toCondition).toList())
                .emergencyContacts(contacts.stream().map(this::toContact).toList())
                .build();
    }

    public PatientProfileResponse.AllergyResponse toAllergy(AllergyEntity e) {
        return PatientProfileResponse.AllergyResponse.builder()
                .id(e.getId()).name(e.getName()).severity(e.getSeverity())
                .reaction(e.getReaction()).diagnosedDate(e.getDiagnosedDate()).build();
    }

    public PatientProfileResponse.MedicationResponse toMedication(MedicationEntity e) {
        return PatientProfileResponse.MedicationResponse.builder()
                .id(e.getId()).name(e.getName()).dosage(e.getDosage()).frequency(e.getFrequency())
                .route(e.getRoute()).startDate(e.getStartDate()).endDate(e.getEndDate())
                .prescribingDoctor(e.getPrescribingDoctor()).build();
    }

    public PatientProfileResponse.SurgeryResponse toSurgery(SurgeryEntity e) {
        return PatientProfileResponse.SurgeryResponse.builder()
                .id(e.getId()).procedureName(e.getProcedureName()).surgeryDate(e.getSurgeryDate())
                .hospitalName(e.getHospitalName()).notes(e.getNotes()).build();
    }

    public PatientProfileResponse.ChronicConditionResponse toCondition(ChronicConditionEntity e) {
        return PatientProfileResponse.ChronicConditionResponse.builder()
                .id(e.getId()).conditionName(e.getConditionName()).diagnosedDate(e.getDiagnosedDate())
                .status(e.getStatus()).notes(e.getNotes()).build();
    }

    public PatientProfileResponse.EmergencyContactResponse toContact(EmergencyContactEntity e) {
        return PatientProfileResponse.EmergencyContactResponse.builder()
                .id(e.getId()).name(e.getName()).relationship(e.getRelationship())
                .phone(e.getPhone()).email(e.getEmail()).primary(e.isPrimaryContact()).build();
    }

    public PatientProfileResponse.PhysicalMeasurementHistoryResponse toHistory(PhysicalMeasurementHistoryEntity e) {
        return PatientProfileResponse.PhysicalMeasurementHistoryResponse.builder()
                .id(e.getId()).heightCm(e.getHeightCm()).weightKg(e.getWeightKg())
                .waistCm(e.getWaistCm()).hipCm(e.getHipCm()).neckCm(e.getNeckCm())
                .bodyFatPercent(e.getBodyFatPercent()).measuredAt(e.getMeasuredAt()).build();
    }

    private PatientProfileResponse.AddressSection buildAddress(
            String line1, String line2, String city, String state, String pincode, String country) {
        if (line1 == null && city == null) {
            return null;
        }
        return PatientProfileResponse.AddressSection.builder()
                .line1(line1).line2(line2).city(city).state(state).pincode(pincode).country(country)
                .build();
    }
}
