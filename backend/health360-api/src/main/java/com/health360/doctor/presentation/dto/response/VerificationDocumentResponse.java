package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class VerificationDocumentResponse {
    UUID id;
    String documentType;
    String fileName;
    String contentType;
    long fileSizeBytes;
    Instant uploadedAt;
}
