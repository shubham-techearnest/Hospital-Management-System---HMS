package com.health360.analytics.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PatientProfileContext(
        UUID patientId,
        UUID tenantId,
        LocalDate dateOfBirth,
        String gender,
        String primaryPhone,
        String permanentAddressLine1,
        String permanentCity,
        String permanentPincode,
        BigDecimal heightCm,
        BigDecimal weightKg,
        BigDecimal waistCm,
        BigDecimal hipCm,
        BigDecimal bodyFatPercent,
        String smokingStatus,
        String alcoholConsumption,
        String exerciseFrequency,
        BigDecimal averageSleepHours,
        Integer stressLevel,
        String occupationType,
        BigDecimal targetWeightKg,
        Integer dailyStepsGoal,
        BigDecimal sleepHoursGoal,
        Integer waterIntakeMlGoal,
        LatestVitals latestVitals,
        LatestLabs latestLabs,
        int allergyCount,
        int severeAllergyCount,
        int medicationCount,
        int conditionCount,
        int emergencyContactCount,
        int familyMemberCount,
        int familyWithHereditaryCount,
        int vitalCount,
        int labCount,
        int documentCount,
        int completionScore
) {
    public record LatestVitals(
            Integer systolicBp,
            Integer diastolicBp,
            Integer heartRate,
            Integer spo2,
            BigDecimal bloodGlucose,
            String glucoseReadingType
    ) {}

    public record LatestLabs(
            BigDecimal hba1c,
            BigDecimal ldl,
            BigDecimal hdl
    ) {}
}
