package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class AwardResponse {
    UUID id;
    String title;
    String organization;
    Integer awardYear;
}
