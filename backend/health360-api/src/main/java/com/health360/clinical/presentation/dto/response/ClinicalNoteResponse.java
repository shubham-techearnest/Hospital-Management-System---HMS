package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ClinicalNoteResponse {
    UUID noteId;
    UUID encounterId;
    String noteType;
    String content;
    Instant recordedAt;
}
