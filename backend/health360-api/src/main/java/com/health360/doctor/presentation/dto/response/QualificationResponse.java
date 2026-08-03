package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class QualificationResponse {
    UUID id;
    String degree;
    String institution;
    Integer yearOfCompletion;
    String country;
}
