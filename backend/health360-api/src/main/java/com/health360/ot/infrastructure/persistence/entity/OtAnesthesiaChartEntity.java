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
@Table(schema = "ot", name = "ot_anesthesia_charts")
@Getter
@Setter
public class OtAnesthesiaChartEntity extends BaseAuditableEntity {

    @Column(name = "procedure_id", nullable = false)
    private UUID procedureId;

    @Column(name = "asa_class", length = 10)
    private String asaClass;

    @Column(name = "anesthesia_type", nullable = false, length = 30)
    private String anesthesiaType;

    @Column(name = "induction_agent", length = 200)
    private String inductionAgent;

    @Column(name = "airway_device", length = 100)
    private String airwayDevice;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(columnDefinition = "TEXT")
    private String complications;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
