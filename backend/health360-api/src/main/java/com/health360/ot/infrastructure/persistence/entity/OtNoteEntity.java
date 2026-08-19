package com.health360.ot.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ot", name = "ot_notes")
@Getter
@Setter
public class OtNoteEntity extends BaseAuditableEntity {

    @Column(name = "procedure_id", nullable = false)
    private UUID procedureId;

    @Column(name = "note_type", nullable = false, length = 20)
    private String noteType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt = Instant.now();

    @Column(name = "recorded_by")
    private UUID recordedBy;
}
