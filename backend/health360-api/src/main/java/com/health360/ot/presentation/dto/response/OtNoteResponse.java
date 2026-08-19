package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class OtNoteResponse {
    UUID noteId;
    UUID procedureId;
    String noteType;
    String content;
    Instant recordedAt;
    UUID recordedBy;
}
