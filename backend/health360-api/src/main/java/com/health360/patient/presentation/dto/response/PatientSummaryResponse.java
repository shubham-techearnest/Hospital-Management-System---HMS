package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PatientSummaryResponse {
    String name;
    Integer age;
    String gender;
    List<AllergySummary> allergies;
    List<MedicationSummary> medications;
    List<ChronicConditionSummary> chronicConditions;
    VitalSignResponse latestVitals;
    LabValueResponse latestLabValues;
    List<HealthGoalSummary> healthGoals;

    @Value
    @Builder
    public static class AllergySummary {
        String name;
        String severity;
        String reaction;
    }

    @Value
    @Builder
    public static class MedicationSummary {
        String name;
        String dosage;
        String frequency;
    }

    @Value
    @Builder
    public static class ChronicConditionSummary {
        String conditionName;
        String status;
    }

    @Value
    @Builder
    public static class HealthGoalSummary {
        String goalType;
        String label;
        String targetDisplay;
    }
}
