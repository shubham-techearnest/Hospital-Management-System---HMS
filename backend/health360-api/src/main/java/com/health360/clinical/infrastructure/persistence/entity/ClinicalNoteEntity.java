package com.health360.clinical.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "clinical", name = "notes")
@Getter
@Setter
public class ClinicalNoteEntity extends BaseAuditableEntity {

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "note_type", nullable = false, length = 30)
    private String noteType = "GENERAL";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt = Instant.now();
}
