package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "death_records")
@Getter
@Setter
public class IpdDeathRecordEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false, unique = true)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "pronounced_at", nullable = false)
    private Instant pronouncedAt;

    @Column(name = "cause_of_death", columnDefinition = "TEXT")
    private String causeOfDeath;

    @Column(name = "certified_by_name", length = 200)
    private String certifiedByName;

    @Column(name = "certified_by_id")
    private UUID certifiedById;

    @Column(name = "place_of_death", length = 100)
    private String placeOfDeath;

    @Column(name = "mortuary_notes", columnDefinition = "TEXT")
    private String mortuaryNotes;

    @Column(name = "country_fields_json", columnDefinition = "TEXT")
    private String countryFieldsJson;
}
