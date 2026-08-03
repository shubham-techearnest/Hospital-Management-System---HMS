package com.health360.patient.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateLifestyleRequest {

    @Size(max = 20)
    private String smokingStatus;

    @Size(max = 20)
    private String smokingFrequency;

    @Size(max = 20)
    private String alcoholConsumption;

    @Size(max = 20)
    private String exerciseFrequency;

    @Size(max = 100)
    private String exerciseType;

    private Integer exerciseDurationMinutes;

    @Size(max = 20)
    private String occupationType;

    private BigDecimal averageSleepHours;

    @Size(max = 20)
    private String dietaryPreference;

    @Min(1)
    @Max(5)
    private Integer stressLevel;
}
