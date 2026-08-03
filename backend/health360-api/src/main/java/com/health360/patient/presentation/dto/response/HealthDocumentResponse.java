package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class HealthDocumentResponse {
    UUID id;
    String fileName;
    String category;
    String title;
    String description;
    long fileSizeBytes;
    String mimeType;
    Instant uploadedAt;
}
