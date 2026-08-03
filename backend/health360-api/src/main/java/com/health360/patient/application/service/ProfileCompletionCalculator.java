package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.presentation.dto.response.PatientProfileResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProfileCompletionCalculator {

    public int calculateScore(PatientProfileEntity profile, int allergyCount, int medicationCount,
                              int conditionCount, int emergencyContactCount, int vitalCount) {
        return calculateBreakdown(profile, allergyCount, medicationCount, conditionCount, emergencyContactCount, vitalCount)
                .getCompletionScore();
    }

    public PatientProfileResponse.ProfileCompletionResponse calculateBreakdown(
            PatientProfileEntity profile, int allergyCount, int medicationCount,
            int conditionCount, int emergencyContactCount, int vitalCount) {

        List<PatientProfileResponse.ProfileCompletionResponse.SectionCompletion> sections = new ArrayList<>();
        int total = 0;

        total += addSection(sections, "BASIC_INFO", 13, isBasicComplete(profile),
                List.of("Date of birth", "Gender"));
        total += addSection(sections, "CONTACT_INFO", 13, isContactComplete(profile),
                List.of("Primary phone", "Permanent address"));
        total += addSection(sections, "PHYSICAL_MEASUREMENTS", 18, isPhysicalComplete(profile),
                List.of("Height", "Weight"));
        total += addSection(sections, "LIFESTYLE", 13, isLifestyleComplete(profile),
                List.of("Smoking status", "Exercise frequency"));
        total += addSection(sections, "MEDICAL_INFO", 18, allergyCount + medicationCount + conditionCount > 0,
                List.of("At least one allergy, medication, or condition"));
        total += addSection(sections, "EMERGENCY_CONTACTS", 10, emergencyContactCount > 0,
                List.of("At least one emergency contact"));
        total += addSection(sections, "VITALS", 15, vitalCount > 0,
                List.of("At least one vital recording"));

        return PatientProfileResponse.ProfileCompletionResponse.builder()
                .completionScore(Math.min(100, total))
                .sections(sections)
                .build();
    }

    private int addSection(List<PatientProfileResponse.ProfileCompletionResponse.SectionCompletion> sections,
                           String name, int weight, boolean completed, List<String> missingWhenIncomplete) {
        sections.add(PatientProfileResponse.ProfileCompletionResponse.SectionCompletion.builder()
                .name(name)
                .weight(weight)
                .completed(completed)
                .missingFields(completed ? List.of() : missingWhenIncomplete)
                .build());
        return completed ? weight : 0;
    }

    private boolean isBasicComplete(PatientProfileEntity p) {
        return p.getDateOfBirth() != null && p.getGender() != null && !p.getGender().isBlank();
    }

    private boolean isContactComplete(PatientProfileEntity p) {
        return p.getPrimaryPhone() != null && !p.getPrimaryPhone().isBlank()
                && p.getPermanentCity() != null && p.getPermanentPincode() != null;
    }

    private boolean isPhysicalComplete(PatientProfileEntity p) {
        return p.getHeightCm() != null && p.getWeightKg() != null;
    }

    private boolean isLifestyleComplete(PatientProfileEntity p) {
        return p.getSmokingStatus() != null && p.getExerciseFrequency() != null;
    }
}
