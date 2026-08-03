package com.health360.patient.presentation.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateHealthGoalsRequest {

    private BigDecimal targetWeightKg;
    private Integer dailyStepsGoal;
    private BigDecimal sleepHoursGoal;
    private Integer waterIntakeMlGoal;
    private Integer weeklyExerciseMinutesGoal;
}
