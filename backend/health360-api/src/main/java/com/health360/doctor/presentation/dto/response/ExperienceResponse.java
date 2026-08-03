package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class ExperienceResponse {
    UUID id;
    String institution;
    String position;
    Integer startYear;
    Integer endYear;
}
