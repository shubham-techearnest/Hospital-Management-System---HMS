package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileCompletionCalculatorTest {

    private final ProfileCompletionCalculator calculator = new ProfileCompletionCalculator();

    @Test
    void emptyProfileHasZeroScore() {
        PatientProfileEntity profile = new PatientProfileEntity();
        assertThat(calculator.calculateScore(profile, 0, 0, 0, 0, 0)).isZero();
    }

    @Test
    void fullyCompletedProfileScores100() {
        PatientProfileEntity profile = new PatientProfileEntity();
        profile.setDateOfBirth(LocalDate.of(1990, 1, 1));
        profile.setGender("MALE");
        profile.setPrimaryPhone("9876543210");
        profile.setPermanentCity("Mumbai");
        profile.setPermanentPincode("400001");
        profile.setHeightCm(new BigDecimal("175"));
        profile.setWeightKg(new BigDecimal("70"));
        profile.setSmokingStatus("NEVER");
        profile.setExerciseFrequency("WEEKLY");

        int score = calculator.calculateScore(profile, 1, 0, 0, 1, 1);
        assertThat(score).isEqualTo(100);
    }

    @Test
    void basicInfoOnlyScores15() {
        PatientProfileEntity profile = new PatientProfileEntity();
        profile.setDateOfBirth(LocalDate.of(1990, 1, 1));
        profile.setGender("FEMALE");

        assertThat(calculator.calculateScore(profile, 0, 0, 0, 0, 0)).isEqualTo(13);
    }
}
