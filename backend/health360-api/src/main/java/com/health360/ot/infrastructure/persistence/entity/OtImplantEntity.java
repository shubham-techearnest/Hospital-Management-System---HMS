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
@Table(schema = "ot", name = "ot_implants")
@Getter
@Setter
public class OtImplantEntity extends BaseAuditableEntity {

    @Column(name = "procedure_id", nullable = false)
    private UUID procedureId;

    @Column(name = "implant_name", nullable = false, length = 200)
    private String implantName;

    @Column(name = "implant_type", length = 100)
    private String implantType;

    @Column(length = 200)
    private String manufacturer;

    @Column(name = "lot_number", length = 100)
    private String lotNumber;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "implanted_at", nullable = false)
    private Instant implantedAt = Instant.now();

    @Column(columnDefinition = "TEXT")
    private String notes;
}
